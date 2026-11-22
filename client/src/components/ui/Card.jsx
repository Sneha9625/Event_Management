import { cn } from '../../utils/cn';

/**
 * White rounded box. `hover` adds a lift + bigger shadow (for clickable cards).
 * `as` lets it render as another element, e.g. <Card as={Link} to="/x">.
 */
export default function Card({ as: Tag = 'div', hover = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        hover && 'transition duration-200 hover:-translate-y-1 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
