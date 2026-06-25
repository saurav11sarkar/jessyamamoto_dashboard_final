import React from 'react'
import ServicesPage from './_components/service-data'
import { PageHeader } from '../_components/PageHeader'

const page = () => {
  return (
    <div>
      <PageHeader />
      <ServicesPage />
    </div>
  )
}

export default page