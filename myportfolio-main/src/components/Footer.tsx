export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          {/* Copyright */}
          <div className="text-neutral-400 text-sm">
            © {currentYear} Venz Aba. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
