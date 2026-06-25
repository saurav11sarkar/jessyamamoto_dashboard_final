import React from 'react'
import UserData from './_components/user-data'
import { PageHeader } from '../_components/PageHeader'

const page = () => {
    return (
        <div>
            <PageHeader />
            <UserData />
        </div>
    )
}

export default page