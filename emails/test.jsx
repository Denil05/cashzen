import EmailTemplate from './template';

export default function TestEmail() {
  return (
    <EmailTemplate
      userName="John Doe"
      type="budget-alert"
      data={{
        percentageUsed: 85,
        budgetAmount: 5000,
        totalExpenses: 4250,
        month: "March",
        year: 2024
      }}
    />
  );
} 