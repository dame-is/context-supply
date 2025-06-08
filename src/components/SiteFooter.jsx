import './SiteFooter.css';

const SiteFooter = () => {
  return (
    <footer className="site-footer">
      <p>
        This website has an A+ carbon rating, making it cleaner than 98% of websites.{' '}
        <a 
          href="https://www.websitecarbon.com/website/context-supply/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View report
        </a>
      </p>
      <p>
        <a 
          href="https://github.com/dame-is/context-supply?tab=MIT-1-ov-file#readme" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          MIT License
        </a>
        {' | '}
        <a 
          href="https://github.com/dame-is/context-supply" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Open Source Code
        </a>
      </p>
    </footer>
  );
};

export default SiteFooter; 