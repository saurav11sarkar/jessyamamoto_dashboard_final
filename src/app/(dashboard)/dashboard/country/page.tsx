import React from "react";
import CountryTable from "./_components/TableListCountry";
import { PageHeader } from "../_components/PageHeader";

export const metadata = {
  title: "Country",
  description: "Country",
};

const page = () => {
  return (
    <div>
      <PageHeader />
      <CountryTable />
    </div>
  );
};

export default page;
