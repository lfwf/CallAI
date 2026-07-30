import homeDocument from "./home.html?raw";

const bodyMarkup = homeDocument
  .match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]
  ?.trim();

export default function HomePage() {
  return (
    <div
      className="site-shell"
      dangerouslySetInnerHTML={{ __html: bodyMarkup }}
    />
  );
}
