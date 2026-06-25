import React, { Suspense } from 'react'
import ResetPassword from './_components/reset-password'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  )
}

export default page