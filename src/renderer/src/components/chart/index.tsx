import React, { useState } from 'react'
import { LineChart } from '@mui/x-charts'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, styled } from '@mui/material'
import CustomIcon from '../icons'
import { capitalizeSentence } from '@renderer/utils/functions'
import CustomTypography from '../typography'
import RecordForm from './record-input'
import { RecordType } from '@renderer/types/record'
import moment from 'moment'

type Props = {
  data: RecordType[]
  type?: 'customer' | 'visitor'
}

const RecordChart = ({ data, type = 'customer' }: Props) => {
  // Extract labels for each week based on recorded_on timestamp
  const labels = data.map((record, index) => {
    const date = moment(record?.recorded_on).toDate()
    return `Week ${index + 1} (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()})`
  })

  // Extract series data for each metric (BMI, BMR, BODY_FAT, etc.) across all weeks
  const series = {
    BMI: data.map((record) => record.bmi),
    BMR: data.map((record) => record.bmr),
    BODY_FAT: data.map((record) => record.body_fat),
    MUSCLE_MASS: data.map((record) => record.visceral_fat),
    BODY_AGE: data.map((record) => record.body_age),
    TSF: data.map((record) => record.tsf),
    HEIGHT: data.map((record) => record.height),
    WEIGHT: data.map((record) => record.weight)
  }

  // Series labels
  const seriesLabels = [
    'BMI',
    'BMR',
    'BODY_FAT',
    'MUSCLE_MASS',
    'BODY_AGE',
    'TSF',
    'HEIGHT',
    'WEIGHT'
  ]

  // Configurable colors for the lines
  const colors = [
    '#3f51b5', // BMI
    '#e91e63', // BMR
    '#9c27b0', // BODY_FAT
    '#ff5722', // MUSCLE_MASS
    '#009688', // BODY_AGE
    '#ff9800', // TSF
    '#8bc34a', // HEIGHT
    '#03a9f4' // WEIGHT
  ]

  // Manage which series are visible (by default, all are visible)
  const [visibleSeries, setVisibleSeries] = useState(new Array(seriesLabels.length).fill(true))

  // Toggle visibility of the series based on checkbox selection
  const handleCheckboxChange = (index: number) => {
    const updatedVisibility = [...visibleSeries]
    updatedVisibility[index] = !updatedVisibility[index]
    setVisibleSeries(updatedVisibility)
  }

  // Prepare series for the LineChart by filtering based on visibility
  const chartSeries = seriesLabels
    .map((label, index) => {
      // Only return series if it's visible and has data
      if (visibleSeries?.[index] && series?.[label]?.length > 0) {
        return {
          data: series?.[label],
          label: label,
          color: colors?.[index]
        }
      }
      return null // Return null for unchecked or empty series
    })
    .filter((e) => !!e) // Remove null values from the array

  const [showFilter, setShowFilter] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)

  return (
    <div style={{ width: '100%', marginTop: '24px', maxWidth: '740px' }}>
      <RecordForm
        type={type}
        open={showForm}
        onClose={() => {
          setShowForm(false)
        }}
      />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '12px'
        }}
      >
        <CustomTypography variant={'h6'} lineHeight={'1'}>
          Chart
        </CustomTypography>
      </Box>

      <LineChart
        // width={400}
        height={400}
        sx={{ minWidth: '100%' }}
        slotProps={{
          legend: {
            hidden: true
          }
        }}
        xAxis={[{ data: labels, label: 'Weeks', scaleType: 'point' }]} // Display week labels on x-axis
        series={chartSeries} // Pass only valid series
      />
      <Accordion
        expanded={showFilter}
        onChange={() => setShowFilter((prev) => !prev)}
        elevation={0}
      >
        <AccordionSummary
          expandIcon={
            <CustomIcon name="LUCIDE_ICONS" icon={showFilter ? 'LuChevronUp' : 'LuChevronDown'} />
          }
        >
          <CustomTypography>{!showFilter ? 'Show' : 'Hide'} Filter</CustomTypography>
        </AccordionSummary>
        <AccordionDetails>
          <LegendContainer style={{ marginBottom: '12px', gap: '12px' }}>
            {seriesLabels.map((label, index) => (
              <LengendButton
                disableElevation={true}
                disableFocusRipple={true}
                disableRipple={true}
                disableTouchRipple={true}
                onClick={() => handleCheckboxChange(index)}
                sx={{
                  '&:hover': {
                    backgroundColor: colors[index] + '1a'
                  }
                }}
                startIcon={
                  <div className="icon-colored" style={{ backgroundColor: colors[index] }}>
                    <CustomIcon
                      name={'LUCIDE_ICONS'}
                      icon={visibleSeries[index] ? 'LuX' : 'LuPlus'}
                      color={'white'}
                      stopPropagation={false}
                      size={14}
                      sx={{ margin: 'auto' }}
                    />
                  </div>
                }
              >
                {capitalizeSentence(label)}
              </LengendButton>
            ))}
          </LegendContainer>
        </AccordionDetails>
      </Accordion>
      {/* Checkboxes for toggling series visibility */}
    </div>
  )
}

export default RecordChart

const LegendContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center'
})

const LengendButton = styled(Button)({
  '& .icon-colored': {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  }
})
