import { Avatar, Fade, styled } from '@mui/material'
import { grey } from '@mui/material/colors'
import { LineChart } from '@mui/x-charts'
import CustomTypography from '@renderer/components/typography'
import { MarathonData } from '@renderer/types/marathon'
import { capitalizeSentence } from '@renderer/utils/functions'
import moment from 'moment'

type Props = {
  data: MarathonData
  cid: string | null
}

export const generateChartDataRange = (from_date: string, to_date: string) => {
  const start = moment(from_date)
  const end = moment(to_date)
  const result: { day: number; date: string }[] = []
  let day = 0

  while (start.isSameOrBefore(end)) {
    result.push({ day, date: start.format('YYYY-MM-DD') })
    start.add(1, 'day')
    day++
  }

  return result
}

const MarathonUserDetail = ({ data, cid }: Props) => {
  const customer = data?.customers.filter((e) => e.cid === cid)[0]
  const chartRange = generateChartDataRange(data.from_date as string, data.to_date as string)
  // const canPlot = data?.graph[cid as keyof typeof data.graph]?.values?.length > 1
  return (
    <Fade in={!!cid && !!customer}>
      <Container
        sx={{
          maxWidth: '340px',
          padding: '16px',
          paddingTop: '32px',
          borderRadius: '12px',
          backgroundColor: '#fff',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <Avatar
          sx={{
            width: '260px',
            height: '260px',
            marginBottom: '16px'
          }}
        />
        <CustomTypography variant="h6" textAlign={'center'}>
          {customer?.name}
        </CustomTypography>
        <div
          style={{ width: '100%', height: '1px', backgroundColor: grey['400'], marginTop: '14px' }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 0px 16px 0px'
          }}
        >
          <CustomTypography variant="h1" gap={'0.1rem'}>
            {data?.positions?.filter((e) => e.cid === cid)?.[0]?.weightLossOrWeightGain}{' '}
            <CustomTypography>Kg</CustomTypography>
          </CustomTypography>
          <CustomTypography>Total {capitalizeSentence(data?.type)}</CustomTypography>
        </div>
        <div style={{ width: '100%' }}>
          <LineChart
            xAxis={[
              {
                id: 'bottomAxis',
                position: 'bottom',
                scaleType: 'point',
                data: chartRange.map((d) => `Day ${d.day + 1}\n${moment(d.date).format('MMM D')}`),
                tickInterval: 'auto'
              }
            ]}
            height={300}
            series={[
              {
                data:
                  data.graph[cid as keyof typeof data.graph]?.values?.map(
                    (e) => e.weightLossOrWeightGain
                  ) ?? [],
                label: capitalizeSentence(data?.type),
                showMark: true
              }
            ]}
          />
        </div>
      </Container>
    </Fade>
  )
}

export default MarathonUserDetail

const Container = styled('div')({
  width: '100%'
})
