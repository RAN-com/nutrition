// import { styled } from '@mui/material'
// import CustomTypography from '@renderer/components/typography'
// import PaginatedTable from '@renderer/pages/customer/table'
// import { CustomerResponse } from '@renderer/types/customers'
// import { AppointmentData } from '@renderer/types/staff'
// import { VisitorData } from '@renderer/types/visitor'
// import moment from 'moment'
// import { useState } from 'react'

import { Box, capitalize, styled, Tab, Tabs } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import PaginatedTable from '@renderer/pages/customer/table'
import { CustomerResponse } from '@renderer/types/customers'
import { AppointmentData } from '@renderer/types/staff'
import { VisitorData } from '@renderer/types/visitor'
import React from 'react'
import NoData from '@renderer/assets/no-data.png'
type Props = {
  appointments: AppointmentData[]
  customers: CustomerResponse[]
  visitors: VisitorData[]
  loading: boolean
}

const headers = {
  appointments: ['Name', 'Email', 'Phone', 'Appointment Date', 'Created On'],
  customers: ['Name', 'Email', 'Phone', 'Gender', 'Address'],
  visitors: ['Name', 'Email', 'Phone', 'Gender', 'Address']
}

const StaffContent = ({ appointments, customers, loading, visitors }: Props) => {
  const [current, setCurrent] = React.useState<'visitors' | 'customers' | 'appointments'>(
    'appointments'
  )
  const [page, setPage] = React.useState({
    appointments: 0,
    customers: 0,
    visitors: 0
  })

  const [rowsPerPage, setRowsPerPage] = React.useState({
    appointments: 10,
    customers: 10,
    visitors: 10
  })

  const data = {
    appointments,
    customers,
    visitors
  }

  const rows: {
    [key in keyof typeof data]: React.ReactNode[][]
  } = {
    appointments: ((data[current] || []) as AppointmentData[]).map((e) => [
      <>{e.name}</>,
      <>{e.email}</>,
      <>{e.phone}</>,
      <>{e.appointment_date}</>,
      <>{e.createdOn}</>
    ]),
    customers: ((data[current] || []) as CustomerResponse[]).map((e) => [
      <>{e.name}</>,
      <>{e.email}</>,
      <>{e.phone}</>,
      <>{e.gender}</>,
      <>{e.address}</>
    ]),
    visitors: ((data[current] || []) as VisitorData[]).map((e) => [
      <>{e.data?.name}</>,
      <>{e.data?.email}</>,
      <>{e.data?.phone}</>,
      <>{e.data?.gender}</>,
      <>{e.data?.address}</>
    ])
  }

  return (
    <Container>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={current}
            onChange={(_evt, value) => {
              setCurrent(value)
            }}
            variant="scrollable"
            aria-label="basic tabs example"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              disableFocusRipple
              disableRipple
              disableTouchRipple
              label="Appointments"
              value={'appointments'}
            />
            <Tab
              disableFocusRipple
              disableRipple
              disableTouchRipple
              label="Visitors"
              value={'visitors'}
            />
            <Tab
              disableFocusRipple
              disableRipple
              disableTouchRipple
              label="Customers"
              value={'customers'}
            />
          </Tabs>
        </Box>
      </div>
      <CustomTypography variant="h4">Recent {capitalize(current ?? '')}</CustomTypography>
      {/* <div className="table-container"> */}
      {rows?.[current]?.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '& img': {
              maxWidth: '320px'
            }
          }}
        >
          <img src={NoData} alt={'hey'} />
          <CustomTypography>{capitalize(current)} data couldn't be found</CustomTypography>
        </Box>
      ) : (
        <PaginatedTable
          sx={{
            height: '100%',
            maxHeight: '100%',
            overflowY: 'scroll'
          }}
          data={{
            header: headers?.[current],
            row: rows?.[current]
          }}
          page={page[current]} // Zero-indexed for page
          rowsPerPage={rowsPerPage[current]}
          loading={loading}
          showPagination={true}
          onRowsPerPageChange={(e) =>
            setRowsPerPage((prev) => ({ ...prev, [current]: e.target.value }))
          }
          onPageChange={(_, newPage) => {
            setPage((prev) => ({
              ...prev,
              [current]: newPage
            }))
          }}
        />
      )}
      {/* </div> */}
    </Container>
  )
}

export default StaffContent

const Container = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: '12px 24px',
  '.table-container': {
    width: '100%',
    height: '100%',
    backgroundColor: 'blue'
  }
})
