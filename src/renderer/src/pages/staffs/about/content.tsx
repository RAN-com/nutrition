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
import moment from 'moment'
import { useAppSelector } from '@renderer/redux/store/hook'
import { RecordType } from '@renderer/types/record'
import Records from '@renderer/pages/customer/record-chart'
import { useNavigate, useSearchParams } from 'react-router-dom'
type Props = {
  appointments: AppointmentData[]
  customers: CustomerResponse[]
  visitors: VisitorData[]
  loading: boolean
  records: RecordType[]
}

const headers = {
  appointments: ['Name', 'Email', 'Phone', 'Appointment Date', 'Created On'],
  customers: ['Name', 'Email', 'Phone', 'Gender', 'Address'],
  visitors: ['Name', 'Email', 'Phone', 'Gender', 'Address']
}

const StaffContent = ({ appointments, customers, loading, visitors, records }: Props) => {
  const [query] = useSearchParams()
  const current = (query.get('tab') || 'appointments') as
    | 'visitors'
    | 'customers'
    | 'appointments'
    | 'about'
    | 'records'
  const navigation = useNavigate()

  const [staff, admin] = useAppSelector((s) => [s.staffs.current_staff, s.auth.user])
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
      <>{moment(e.appointment_date).format('DD/MM/YYYY HH:mm:ss')}</>,
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
              query.set('tab', value)
              const qr = query.toString()
              navigation(`/staffs/${staff?.data?.sid}?${qr}`)
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
              label="About"
              value={'about'}
            />
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

            <Tab
              disableFocusRipple
              disableRipple
              disableTouchRipple
              label="Past Records"
              value={'records'}
            />
          </Tabs>
        </Box>
      </div>
      {current !== 'about' && current !== 'records' && (
        <>
          <CustomTypography variant="h4">Recent {capitalize(current ?? '')}</CustomTypography>
        </>
      )}
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
      ) : current.includes('about') ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CustomTypography variant="h4" textAlign={'center'} width={'100%'}>
            {staff?.data?.name}
          </CustomTypography>
          <CustomTypography
            textAlign={'center'}
            width={'100%'}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            {staff?.data?.about}
          </CustomTypography>
        </div>
      ) : current === 'records' ? (
        <Records
          records={records}
          gender={staff?.data?.gender as string}
          center_address={admin?.center_address as string}
          name={staff?.data?.name as string}
          phone={staff?.data?.phone}
        />
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
