import React from 'react'
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  SxProps,
  Theme
} from '@mui/material'
import { grey } from '@mui/material/colors'

interface Data {
  header: string[]
  row: React.ReactNode[][]
}

interface PaginatedTableProps {
  data: Data
  loading: boolean
  page: number
  showPagination?: boolean
  rowsPerPage: number
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  sx?: SxProps<Theme>
  total?: number
  clickable?: boolean
  onClick?(e: number): void
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  data,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  clickable = false,
  sx,
  total,
  showPagination = true,
  onClick
}) => {
  const paginatedRows =
    data?.row?.length >= 1
      ? data?.row?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data?.row

  return (
    <>
      <TableContainer
        className="scrollbar"
        sx={{
          ...sx,
          position: 'relative',
          top: 0,
          backgroundColor: '#f5f5f5',
          borderRadius: '12px',
          width: '100%',
          overflowY: 'auto'
        }}
      >
        <Table
          sx={{
            width: '100%',
            borderRadius: '12px',
            overflowY: 'auto'
          }}
          aria-label="simple table"
        >
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 100
            }}
          >
            <TableRow
              sx={{
                '& th': {
                  backgroundColor: '#b9b9b9',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  borderBottom: '1px solid #FBFCFB'
                }
              }}
            >
              {data.header.map((e, index) => (
                <TableCell align="center" key={index}>
                  {e}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: '#ffffff' }}>
            {loading ? (
              <>loading.....</>
            ) : paginatedRows?.length === 0 ? (
              <TableRow
                sx={{
                  'th, td': {
                    borderBottom: '0px'
                  }
                }}
              >
                <TableCell colSpan={data.header.length} align="center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows?.map((row, idx) => (
                <TableRow
                  key={idx}
                  onClick={() => onClick?.(idx)}
                  sx={{
                    cursor: clickable ? 'pointer' : 'unset',
                    '&:last-child td, &:last-child th': { border: 0 },
                    th: {
                      '&:hover': {
                        backgroundColor: '#f6f6f7b7'
                      },
                      whiteSpace: 'nowrap',
                      borderBottomColor: '#3f3f3f'
                    }
                  }}
                >
                  {row?.map((r, index) => (
                    <TableCell component={'th'} align="center" scope="row" key={index}>
                      {r}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <TablePagination
          component="div"
          count={total ?? data.row.length} // Total number of rows
          page={page}
          onPageChange={onPageChange!}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]} // Custom options for rows per page
          sx={{
            '.MuiTablePagination-actions': {
              '.MuiButtonBase-root': {
                '&.Mui-disabled': {
                  color: grey['500']
                }
              }
            },
            '.MuiInputBase-root': {
              '.MuiSvgIcon-root': {
                color: grey['500']
              }
            }
          }}
        />
      )}
    </>
  )
}

export default PaginatedTable
