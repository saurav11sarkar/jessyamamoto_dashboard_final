import React from "react";
import SubscriptionManagement from "./_components/subscription-data";
import { PageHeader } from "../_components/PageHeader";

const page = () => {
  return (
    <div>
      <PageHeader />
      <SubscriptionManagement />
    </div>
  );
};

export default page;
