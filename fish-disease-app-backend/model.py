import torch
import torch.nn as nn
import torch.nn.functional as F

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
        self.se = CenterSEBlock(mid_channels, reduction=se_reduction, center_frac=center_frac)
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

class CenterEfficientNet5x5(nn.Module):
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