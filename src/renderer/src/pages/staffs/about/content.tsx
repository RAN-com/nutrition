import { styled } from '@mui/material'
import CustomTypography from '@renderer/components/typography'
import PaginatedTable from '@renderer/pages/customer/table'
import { CustomerResponse } from '@renderer/types/customers'
import { AppointmentData } from '@renderer/types/staff'
import { VisitorData } from '@renderer/types/visitor'
import moment from 'moment'

type Props = {
  appointments: AppointmentData[]
  customers: CustomerResponse[]
  visitors: VisitorData[]
}
const StaffContent = ({ appointments, customers, visitors }: Props) => {
  return (
    <div
      className="scrollbar"
      style={{
        all: 'inherit',
        padding: '12px 24px',
        gap: '42px',
        backgroundColor: 'transparent'
      }}
    >
      <Container>
        <CustomTypography variant={'h4'}>Recent Appointments</CustomTypography>
        <PaginatedTable
          sx={{
            height: '100%'
          }}
          data={{
            header: ['Name', 'Email', 'Phone', 'Gender', 'Created On'],
            row: appointments.map((cst) => [
              <>{cst.name}</>,
              <>{cst.email}</>,
              <>{cst.phone}</>,
              <>{cst.gender}</>,
              <>{moment(cst.createdOn).format('DD-MM-YYYY HH:MM')}</>
            ])
          }}
          page={1}
          rowsPerPage={10000}
          loading={false}
          showPagination={false}
        />
      </Container>
      <RowContainer>
        <Container>
          <CustomTypography variant={'h4'}>Assigned Customers</CustomTypography>
          <PaginatedTable
            sx={{
              height: '100%'
            }}
            data={{
              header: ['Name', 'Email', 'Phone', 'Gender'],
              row: customers.map((cst) => [
                <>{cst.name}</>,
                <>{cst.email}</>,
                <>{cst.phone}</>,
                <>{cst.gender}</>
              ])
            }}
            page={1}
            rowsPerPage={10000}
            loading={false}
            showPagination={false}
          />
        </Container>
        <Container>
          <CustomTypography variant={'h4'}>Assigned Visitors</CustomTypography>
          <PaginatedTable
            sx={{
              height: '100%'
            }}
            data={{
              header: ['Name', 'Email', 'Phone', 'Gender'],
              row: visitors.map((cst) => [
                <>{cst?.data?.name}</>,
                <>{cst?.data?.email}</>,
                <>{cst?.data?.phone}</>,
                <>{cst?.data?.gender}</>
              ])
            }}
            page={1}
            rowsPerPage={10000}
            loading={false}
            showPagination={false}
          />
        </Container>
      </RowContainer>
    </div>
  )
}

export default StaffContent

const RowContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem'
})

const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minHeight: '320px'
})
