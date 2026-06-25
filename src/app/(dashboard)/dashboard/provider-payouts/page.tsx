import React from "react";
import ProviderPayoutsPage from "./_components/payouts-data";
import { PageHeader } from "../_components/PageHeader";

const page = () => {
  return (
    <div>
      <PageHeader />
      <ProviderPayoutsPage />
    </div>
  );
};

export default page;
