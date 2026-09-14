import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="details" />
      <Tabs.Screen name="detect" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}