import { Link, useLocation } from 'react-router';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const Breadcrumbs = () => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert URL segments to readable labels
      let label = segment;
      
      // Handle common routes
      switch (segment) {
        case 'flashcards':
          label = 'Flashcards';
          break;
        case 'fill_in_the_blanks':
          label = 'Fill in the Blanks';
          break;
        case 'make':
          label = 'Create';
          break;
        case 'practice':
          label = 'Practice';
          break;
        case 'dashboard':
          label = 'Dashboard';
          break;
        case 'profile':
          label = 'Profile';
          break;
        case 'settings':
          label = 'Settings';
          break;
        default:
          // Convert kebab-case to Title Case
          label = segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      }
      
      // Don't add the last segment as a link (current page)
      if (index === pathnames.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 px-6 py-3 bg-gray-50 border-b border-gray-200">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index === 0 ? (
            <HomeIcon className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 mx-1 text-gray-400" />
          )}
          
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-gray-700 transition-colors duration-150"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
