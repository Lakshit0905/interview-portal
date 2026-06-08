import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import Link from "next/link";

const components = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const url = href ?? "#";
    const ext = url.startsWith("http");
    return ext
      ? <a href={url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80">{children}</a>
      : <Link href={url} className="text-primary underline underline-offset-4 hover:text-primary/80">{children}</Link>;
  },
};

export function Mdx({ source }: { source: string }) {
  return (
    <article className="prose prose-invert max-w-none
      prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight
      prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-10 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
      prose-h3:text-lg prose-p:leading-relaxed prose-p:text-foreground/90
      prose-a:no-underline prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
      prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
      prose-pre:p-0 prose-pre:bg-transparent prose-strong:text-foreground
      prose-li:text-foreground/90 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
      prose-table:text-sm prose-th:text-left prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-wider">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
}
