import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 text-dark-600 hover:text-primary-600 transition"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-dark-400" />
          {item.path && index < items.length - 1 ? (
            <Link
              to={item.path}
              className="text-dark-600 hover:text-primary-600 transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-dark-900 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;

