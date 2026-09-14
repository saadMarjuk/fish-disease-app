import os
import io
import json
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms
import torch.nn as nn
import torch.nn.functional as F

from model import CenterEfficientNet5x5


app = FastAPI(title="Fish Disease Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================
# DISEASE INFORMATION
# Must match EXACT class names from the trained models
# ============================================================

DISEASE_INFO = {
    # ---------------- TILAPIA ----------------
    "1.Streptococcosis (STr)": {
        "display_name": "Streptococcosis",
        "description": "A bacterial disease that can affect the brain, eyes, and swimming behavior of tilapia.",
        "treatment": "Isolate infected fish and consult an aquaculture expert for proper antibiotic treatment.",
        "prevention": "Maintain good water quality, reduce stress, and avoid overcrowding."
    },
    "2.Parasitic Diseases (Prd)": {
        "display_name": "Parasitic Disease",
        "description": "A parasitic infection that may cause irritation, weakness, and poor fish health.",
        "treatment": "Use suitable anti-parasitic treatment under expert guidance and separate infected fish if possible.",
        "prevention": "Keep water clean, quarantine new fish, and monitor stock regularly."
    },
    "3.Columnaris Disease(Col)": {
        "display_name": "Columnaris Disease",
        "description": "A bacterial infection that often affects the gills, skin, and fins of fish.",
        "treatment": "Improve water quality immediately and use proper antibacterial treatment advised by a specialist.",
        "prevention": "Avoid overcrowding, reduce stress, and maintain proper hygiene."
    },
    "4.Tilapia Lake virus (TiLV)": {
        "display_name": "Tilapia Lake Virus",
        "description": "A serious viral disease in tilapia that may lead to high mortality.",
        "treatment": "There is no specific cure. Isolate infected fish and improve farm management and hygiene.",
        "prevention": "Use healthy stock, disinfect tools, and maintain strict biosecurity."
    },
    "5.Motile Aeromonad Septicemia (MAS)": {
        "display_name": "Motile Aeromonad Septicemia",
        "description": "A bacterial disease that can cause hemorrhage, ulcers, and weakness in fish.",
        "treatment": "Separate affected fish and seek expert advice for proper antibiotic use.",
        "prevention": "Keep water clean, avoid stress, and remove infected fish quickly."
    },
    "6.Normal Nile Tilapia(NN)": {
        "display_name": "Normal Nile Tilapia",
        "description": "Healthy tilapia with no visible disease symptoms.",
        "treatment": "No treatment is needed. Continue normal care and proper feeding.",
        "prevention": "Maintain clean water, balanced nutrition, and routine observation."
    },

    # ---------------- SHRIMP ----------------
    "BG": {
        "display_name": "Black Gill Disease",
        "description": "A condition where shrimp gills become dark due to environmental stress, irritation, or infection.",
        "treatment": "Improve water quality, reduce harmful substances, and manage pond conditions carefully.",
        "prevention": "Ensure proper aeration, remove waste, and maintain a healthy pond environment."
    },
    "Healthy": {
        "display_name": "Healthy Shrimp",
        "description": "No disease detected in the shrimp.",
        "treatment": "No treatment is needed.",
        "prevention": "Maintain clean water, proper feeding, and regular farm monitoring."
    },
    "WSSV": {
        "display_name": "White Spot Syndrome Virus",
        "description": "A highly contagious viral disease that spreads quickly and can cause major losses in shrimp farming.",
        "treatment": "There is no direct cure. Remove infected shrimp immediately and strengthen biosecurity.",
        "prevention": "Use disease-free seed, disinfect equipment, control water quality, and avoid contamination."
    },
    "WSSV_BG": {
        "display_name": "White Spot Syndrome Virus + Black Gill",
        "description": "A combined condition involving viral infection and gill damage or environmental stress.",
        "treatment": "Remove infected stock, improve pond hygiene, and correct water quality problems quickly.",
        "prevention": "Maintain strong biosecurity, monitor pond health regularly, and reduce environmental stress."
    },

    # ---------------- SALMON ----------------
    "FreshFish_a_salmon_fresh_": {
        "display_name": "Healthy Salmon",
        "description": "No disease detected in the salmon.",
        "treatment": "No treatment is needed.",
        "prevention": "Maintain clean water, proper feeding, and regular health checks."
    },
    "InfectedFish_salmon_dis": {
        "display_name": "Infected Salmon",
        "description": "The salmon shows signs of disease or infection.",
        "treatment": "Isolate affected fish and consult a fish health specialist for proper diagnosis and treatment.",
        "prevention": "Maintain hygiene, monitor fish regularly, and prevent contact with infected stock."
    }
}


# ============================================================
# TILAPIA MODEL
# ============================================================

with open(os.path.join(BASE_DIR, "tilapia_classes.json"), "r") as f:
    tilapia_class_names = json.load(f)

with open(os.path.join(BASE_DIR, "tilapia_config.json"), "r") as f:
    tilapia_config = json.load(f)

tilapia_model = CenterEfficientNet5x5(
    num_classes=tilapia_config["num_classes"],
    center_frac=tilapia_config["center_frac"]
)

tilapia_model.load_state_dict(
    torch.load(
        os.path.join(BASE_DIR, "tilapia_model.pth"),
        map_location=DEVICE
    )
)

tilapia_model.to(DEVICE)
tilapia_model.eval()

tilapia_transform = transforms.Compose([
    transforms.Resize((tilapia_config["img_size"], tilapia_config["img_size"])),
    transforms.ToTensor(),
    transforms.Normalize(
        tilapia_config["mean"],
        tilapia_config["std"]
    ),
])


# ============================================================
# SHRIMP MODEL CLASSES
# ============================================================

class CenterGlobalAvgPool2d(nn.Module):
    def __init__(self, center_frac: float = 0.5):
        super().__init__()
        self.center_frac = center_frac

    def forward(self, x):
        b, c, h, w = x.shape
        ch = max(1, int(h * self.center_frac))
        cw = max(1, int(w * self.center_frac))

        start_h = (h - ch) // 2
        start_w = (w - cw) // 2

        x_center = x[:, :, start_h:start_h + ch, start_w:start_w + cw]
        return x_center.mean(dim=(2, 3))


class CenterSEBlock(nn.Module):
    def __init__(self, channels: int, reduction: int = 4, center_frac: float = 0.5):
        super().__init__()
        self.center_pool = CenterGlobalAvgPool2d(center_frac=center_frac)
        hidden = max(1, channels // reduction)
        self.fc1 = nn.Linear(channels, hidden)
        self.fc2 = nn.Linear(hidden, channels)

    def forward(self, x):
        b, c, _, _ = x.shape
        z = self.center_pool(x)
        z = F.relu(self.fc1(z), inplace=True)
        z = torch.sigmoid(self.fc2(z))
        z = z.view(b, c, 1, 1)
        return x * z


class CenterMBConv5x5(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        expand_ratio: int = 4,
        stride: int = 1,
        center_frac: float = 0.5,
        se_reduction: int = 4,
    ):
        super().__init__()

        self.use_residual = stride == 1 and in_channels == out_channels
        mid_channels = in_channels * expand_ratio

        layers = []

        if expand_ratio != 1:
            layers.append(nn.Conv2d(in_channels, mid_channels, kernel_size=1, bias=False))
            layers.append(nn.BatchNorm2d(mid_channels))
            layers.append(nn.SiLU())
        else:
            mid_channels = in_channels

        layers.append(
            nn.Conv2d(
                mid_channels,
                mid_channels,
                kernel_size=5,
                stride=stride,
                padding=2,
                groups=mid_channels,
                bias=False,
            )
        )
        layers.append(nn.BatchNorm2d(mid_channels))
        layers.append(nn.SiLU())

        self.conv = nn.Sequential(*layers)
        self.se = CenterSEBlock(
            mid_channels,
            reduction=se_reduction,
            center_frac=center_frac
        )

        self.project = nn.Sequential(
            nn.Conv2d(mid_channels, out_channels, kernel_size=1, bias=False),
            nn.BatchNorm2d(out_channels),
        )

    def forward(self, x):
        identity = x
        out = self.conv(x)
        out = self.se(out)
        out = self.project(out)

        if self.use_residual:
            out = out + identity
        return out


class ShrimpCenterEfficientNet5x5(nn.Module):
    def __init__(self, num_classes: int, center_frac: float = 0.5):
        super().__init__()

        self.stem = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.SiLU(),
        )

        settings = [
            (32, 32, 1, 1, 1),
            (32, 48, 4, 2, 2),
            (48, 64, 4, 2, 2),
            (64, 96, 4, 3, 2),
            (96, 160, 6, 3, 2),
        ]

        blocks = []
        for in_c, out_c, t, n, s in settings:
            for i in range(n):
                stride = s if i == 0 else 1
                blocks.append(
                    CenterMBConv5x5(
                        in_channels=in_c if i == 0 else out_c,
                        out_channels=out_c,
                        expand_ratio=t,
                        stride=stride,
                        center_frac=center_frac,
                        se_reduction=4,
                    )
                )

        self.blocks = nn.Sequential(*blocks)

        self.head_conv = nn.Sequential(
            nn.Conv2d(160, 256, kernel_size=1, bias=False),
            nn.BatchNorm2d(256),
            nn.SiLU(),
        )

        self.center_pool = CenterGlobalAvgPool2d(center_frac=center_frac)
        self.dropout = nn.Dropout(0.2)
        self.fc = nn.Linear(256, num_classes)

    def forward(self, x):
        x = self.stem(x)
        x = self.blocks(x)
        x = self.head_conv(x)
        x = self.center_pool(x)
        x = self.dropout(x)
        x = self.fc(x)
        return x


# ============================================================
# SHRIMP MODEL
# ============================================================

shrimp_checkpoint_path = os.path.join(BASE_DIR, "shrimp_model_full.pth")
shrimp_checkpoint = torch.load(shrimp_checkpoint_path, map_location=DEVICE)

shrimp_class_names = shrimp_checkpoint["class_names"]
shrimp_num_classes = shrimp_checkpoint["num_classes"]
shrimp_img_size = shrimp_checkpoint.get("img_size", 224)
shrimp_center_frac = shrimp_checkpoint.get("center_frac", 0.5)

shrimp_model = ShrimpCenterEfficientNet5x5(
    num_classes=shrimp_num_classes,
    center_frac=shrimp_center_frac
)

shrimp_model.load_state_dict(shrimp_checkpoint["model_state_dict"])
shrimp_model.to(DEVICE)
shrimp_model.eval()

shrimp_transform = transforms.Compose([
    transforms.Resize((shrimp_img_size, shrimp_img_size)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    ),
])


# ============================================================
# SALMON MODEL
# ============================================================

with open(os.path.join(BASE_DIR, "salmon_classes.json"), "r") as f:
    salmon_class_names = json.load(f)

with open(os.path.join(BASE_DIR, "salmon_config.json"), "r") as f:
    salmon_config = json.load(f)

salmon_model = CenterEfficientNet5x5(
    num_classes=salmon_config["num_classes"],
    center_frac=salmon_config["center_frac"]
)

salmon_model.load_state_dict(
    torch.load(
        os.path.join(BASE_DIR, "salmon_model.pth"),
        map_location=DEVICE
    )
)

salmon_model.to(DEVICE)
salmon_model.eval()

salmon_transform = transforms.Compose([
    transforms.Resize((salmon_config["img_size"], salmon_config["img_size"])),
    transforms.ToTensor(),
    transforms.Normalize(
        salmon_config["mean"],
        salmon_config["std"]
    ),
])


# ============================================================
# HELPER FUNCTION
# ============================================================

def predict_image(image: Image.Image, model, transform, class_names):
    x = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(x)
        probs = torch.softmax(outputs, dim=1)
        pred_idx = torch.argmax(probs, dim=1).item()
        confidence = probs[0][pred_idx].item()

    predicted_class = str(class_names[pred_idx]).strip()
    info = DISEASE_INFO.get(predicted_class, {})

    return {
        "predicted_class": predicted_class,
        "display_name": info.get("display_name", predicted_class),
        "confidence": float(confidence),
        "description": info.get("description", "No description available."),
        "treatment": info.get("treatment", "No treatment advice available."),
        "prevention": info.get("prevention", "No prevention advice available.")
    }


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def home():
    return {"message": "Fish disease backend is running"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": str(DEVICE),
        "tilapia_classes": len(tilapia_class_names),
        "shrimp_classes": len(shrimp_class_names),
        "salmon_classes": len(salmon_class_names),
    }


@app.post("/predict/tilapia")
async def predict_tilapia(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return predict_image(image, tilapia_model, tilapia_transform, tilapia_class_names)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tilapia prediction failed: {str(e)}")


@app.post("/predict/shrimp")
async def predict_shrimp(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return predict_image(image, shrimp_model, shrimp_transform, shrimp_class_names)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shrimp prediction failed: {str(e)}")


@app.post("/predict/salmon")
async def predict_salmon(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return predict_image(image, salmon_model, salmon_transform, salmon_class_names)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Salmon prediction failed: {str(e)}")