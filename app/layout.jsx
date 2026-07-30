import "./style.css";

export const metadata = {
  title: "AI DROP — AI 创作活动雷达",
  description: "聚合全球平台、软件与公司发起的 AI 影像、设计、开发和艺术创作活动。",
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
