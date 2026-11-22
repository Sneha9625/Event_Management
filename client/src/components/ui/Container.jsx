import { cn } from '../../utils/cn';

const SIZES = {
  default: 'max-w-7xl px-4 sm:px-6 lg:px-8', // app pages (dashboard, forms...)
  narrow: 'max-w-4xl px-4 sm:px-6 lg:px-8', // focused forms
  full: 'max-w-[1920px] px-4 sm:px-6 lg:px-10 xl:px-16', // landing page, navbar, footer: (almost) edge to edge
};

// The page-width wrapper used everywhere, so sections line up.
export default function Container({ as: Tag = 'div', size = 'default', className, children, ...props }) {
  return (
    <Tag className={cn('mx-auto w-full', SIZES[size], className)} {...props}>
      {children}
    </Tag>
  );
}
