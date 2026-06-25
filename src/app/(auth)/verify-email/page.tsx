import React, { Suspense } from 'react'
import VerifyEmail from './_components/verify-email'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmail/>
    </Suspense>
  )
}

export default page