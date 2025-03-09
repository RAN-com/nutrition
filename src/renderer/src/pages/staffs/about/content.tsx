// import { styled } from '@mui/material'
// import CustomTypography from '@renderer/components/typography'
// import PaginatedTable from '@renderer/pages/customer/table'
// import { CustomerResponse } from '@renderer/types/customers'
// import { AppointmentData } from '@renderer/types/staff'
// import { VisitorData } from '@renderer/types/visitor'
// import moment from 'moment'
// import { useState } from 'react'

import { capitalize, styled, Tab, Tabs } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import PaginatedTable from '@renderer/pages/customer/table'
import { CustomerResponse } from '@renderer/types/customers'
import { AppointmentData } from '@renderer/types/staff'
import { VisitorData } from '@renderer/types/visitor'
import React from 'react'

// type Props = {
//   appointments: AppointmentData[]
//   customers: CustomerResponse[]
//   visitors: VisitorData[]
//   loading: boolean
// }

// const StaffContent = ({ appointments, customers, visitors, loading }: Props) => {
//   const [appointmentsPage, setAppointmentsPage] = useState(1)
//   const [customersPage, setCustomersPage] = useState(1)
//   const [visitorsPage, setVisitorsPage] = useState(1)
//   const rowsPerPage = 10 // You can adjust the number of rows per page if needed

//   const handlePageChangeAppointments = (event: any, newPage: number) => {
//     setAppointmentsPage(newPage + 1) // +1 to convert zero-indexed page to 1-indexed
//   }

//   const handlePageChangeCustomers = (event: any, newPage: number) => {
//     setCustomersPage(newPage + 1)
//   }

//   const handlePageChangeVisitors = (event: any, newPage: number) => {
//     setVisitorsPage(newPage + 1)
//   }

//   return (
//     <div
//       className="scrollbar"
//       style={{
//         all: 'inherit',
//         padding: '12px 24px',
//         gap: '42px',
//         backgroundColor: 'transparent'
//       }}
//     >
//       <Container>
//         <CustomTypography variant={'h4'}>Recent Appointments</CustomTypography>
//         <PaginatedTable
//           sx={{
//             height: '100%',
//             maxHeight: '100%',
//             overflowY: 'scroll'
//           }}
//           data={{
//             header: ['Name', 'Email', 'Phone', 'Appointment Date', 'Created On'],
//             row: appointments.map((cst) => [
//               <>{cst.name}</>,
//               <>{cst.email}</>,
//               <>{cst.phone}</>,
//               <>{moment(cst.appointment_date).format('DD-MM-YYYY HH:mm')}</>,
//               <>{moment(cst.createdOn).format('DD-MM-YYYY HH:mm')}</>
//             ])
//           }}
//           page={appointmentsPage - 1} // Zero-indexed for page
//           rowsPerPage={rowsPerPage}
//           loading={loading}
//           showPagination={true}
//           onPageChange={handlePageChangeAppointments}
//         />
//       </Container>

//       <RowContainer>
//         <Container>
//           <CustomTypography variant={'h4'}>Assigned Customers</CustomTypography>
//           <PaginatedTable
//             sx={{
//               height: '100%',
//               maxHeight: '100%',
//               overflowY: 'scroll'
//             }}
//             data={{
//               header: ['Name', 'Email', 'Phone', 'Gender'],
//               row: customers.map((cst) => [
//                 <>{cst.name}</>,
//                 <>{cst.email}</>,
//                 <>{cst.phone}</>,
//                 <>{cst.gender}</>
//               ])
//             }}
//             page={customersPage - 1} // Zero-indexed for page
//             rowsPerPage={rowsPerPage}
//             loading={loading}
//             showPagination={true}
//             onPageChange={handlePageChangeCustomers}
//           />
//         </Container>

//         <Container>
//           <CustomTypography variant={'h4'}>Assigned Visitors</CustomTypography>
//           <PaginatedTable
//             sx={{
//               height: '100%',
//               maxHeight: '100%',
//               overflowY: 'scroll'
//             }}
//             data={{
//               header: ['Name', 'Email', 'Phone', 'Gender'],
//               row: visitors.map((cst) => [
//                 <>{cst?.data?.name}</>,
//                 <>{cst?.data?.email}</>,
//                 <>{cst?.data?.phone}</>,
//                 <>{cst?.data?.gender}</>
//               ])
//             }}
//             page={visitorsPage - 1} // Zero-indexed for page
//             rowsPerPage={rowsPerPage}
//             loading={loading}
//             showPagination={true}
//             onPageChange={handlePageChangeVisitors}
//           />
//         </Container>
//       </RowContainer>
//     </div>
//   )
// }

// export default StaffContent

// const RowContainer = styled('div')({
//   width: '100%',
//   display: 'grid',
//   gridTemplateColumns: '1fr 1fr',
//   gap: '1rem'
// })

// const Container = styled('div')({
//   width: '100%',
//   height: '100%',
//   display: 'flex',
//   flexDirection: 'column',
//   gap: '12px',
//   minHeight: '320px'
// })

type Props = {
  appointments: AppointmentData[]
  customers: CustomerResponse[]
  visitors: VisitorData[]
  loading: boolean
}

const headers = {
  appointments: ['Name', 'Email', 'Phone', 'Appointment Date', 'Created On'],
  customers: ['Name', 'Email', 'Phone', 'Gender'],
  visitors: ['Name', 'Email', 'Phone', 'Gender']
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
    appointments: (data[current] as AppointmentData[]).map((e) => [
      <>{e.name}</>,
      <>{e.email}</>,
      <>{e.phone}</>,
      <>{e.appointment_date}</>,
      <>{e.createdOn}</>
    ]),
    customers: (data[current] as CustomerResponse[]).map((e) => [
      <>{e.name}</>,
      <>{e.email}</>,
      <>{e.phone}</>,
      <>{e.gender}</>,
      <>{e.address}</>
    ]),
    visitors: (data[current] as VisitorData[]).map((e) => [
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
        <Tabs
          value={'value'}
          onChange={({ currentTarget: { nodeValue } }) => {
            console.log(nodeValue)
            setCurrent(nodeValue as typeof current)
          }}
          variant="scrollable"
          aria-label="basic tabs example"
        >
          <Tab label="Appointments" value={'appointments'} />
          <Tab label="Visitors" value={'visitors'} />
          <Tab label="Customers" value={'customers'} />
        </Tabs>
        {/* <ButtonGroup>
          <Button
            onClick={() => setCurrent('appointments')}
            variant={current === 'appointments' ? 'contained' : 'outlined'}
          >
            Appointments
          </Button>
          <Button
            onClick={() => setCurrent('visitors')}
            variant={current === 'visitors' ? 'contained' : 'outlined'}
          >
            Visitors
          </Button>
          <Button
            onClick={() => setCurrent('customers')}
            variant={current === 'customers' ? 'contained' : 'outlined'}
          >
            Customers
          </Button>
        </ButtonGroup> */}
      </div>
      <CustomTypography variant="h4">Recent {capitalize(current)}</CustomTypography>
      {/* <div className="table-container"> */}
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
