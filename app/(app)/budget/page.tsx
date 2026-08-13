import { notFound } from "next/navigation";
import { DollarSign } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { budgetSummary } from "@/lib/data";
import { getActiveSession, seatCanAccess } from "@/lib/identity";

export default async function BudgetPage() {
  /*
    Budget is the one area-level exclusion in the core model: the stake high
    councilor is a stake officer participating in ward operations, not a member
    of the presidency that stewards the ward's money.

    The nav hides it for him. This is what enforces it -- omitting a link is
    presentation, and a page that still renders on direct navigation is a leak.
  */
  const session = await getActiveSession();
  if (!seatCanAccess(session?.seat, "budget")) {
    notFound();
  }

  const budgetSpent = budgetSummary.categories.reduce((sum, item) => sum + item.spent, 0);
  const budgetPending = budgetSummary.categories.reduce((sum, item) => sum + item.pending, 0);
  const budgetRemaining = budgetSummary.totalAllocated - budgetSpent - budgetPending;

  return (
    <>
      <PageHeading
        title="Budget"
        description="Operational view of the quorum budget, spending categories, and pending commitments."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BudgetMetric label="Remaining" value={formatCurrency(budgetRemaining)} />
        <BudgetMetric label="Allocated" value={formatCurrency(budgetSummary.totalAllocated)} />
        <BudgetMetric label="Spent" value={formatCurrency(budgetSpent)} />
        <BudgetMetric label="Pending" value={formatCurrency(budgetPending)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Budget guardrail</CardTitle>
            <CardDescription>Keep the budget view operational.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <DollarSign />
              Quorum operating budget
            </div>
            <p className="text-muted-foreground">
              Track planning totals, categories, and pending commitments here. Keep reimbursements,
              individual financial needs, and confidential assistance outside wardOS.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget categories</CardTitle>
            <CardDescription>Spending progress by operating area.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {budgetSummary.categories.map((category) => {
              const committed = category.spent + category.pending;
              const percent = Math.min(Math.round((committed / category.allocated) * 100), 100);

              return (
                <div key={category.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(committed)} committed of {formatCurrency(category.allocated)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(category.allocated - committed)} left
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-foreground"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function BudgetMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
