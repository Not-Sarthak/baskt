import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Basket Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        The basket you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
