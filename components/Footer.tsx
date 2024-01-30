export default async function Footer() {
  return (
    <footer className="w-full flex flex-col items-center mt-6 pt-6 pb-4 text-xs text-muted-foreground opacity-40 bg-card border-t shadow-inner">
      <div>&copy; Pau Fernández, {new Date().getFullYear()}</div>
    </footer>
  );
}
