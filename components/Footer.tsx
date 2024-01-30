export default async function Footer() {
  return (
    <footer className="flex flex-col items-center pt-6 pb-4 text-xs text-stone-400">
      <div>&copy; Pau Fernández, {new Date().getFullYear()}</div>
    </footer>
  );
}
