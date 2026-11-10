import { Card } from "./Card";
import { PageHeader } from "./PageHeader";

/** Zaślepka dla widoków, które powstaną w kolejnych taskach. */
export function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <div className="px-5 py-12 text-center">
          <p className="font-medium">Ten widok jest w przygotowaniu</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
        </div>
      </Card>
    </>
  );
}
