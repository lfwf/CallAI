import "./style.css";

export const metadata = {
  title: "CALL//AI — AI 创作活动索引",
  description: "聚合全球平台、软件与公司发起的 AI 影像、设计、开发和艺术创作活动。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eeeade",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <script src="/client.js" defer />
      </body>
    </html>
  );
}
