import { Button } from '@mui/material'
import PageHeader from '@renderer/components/header/pageHeader'
import CustomIcon from '@renderer/components/icons'
import CustomTypography from '@renderer/components/typography'

import { useNavigate } from 'react-router-dom'

const AboutHeader = () => {
  const navigate = useNavigate()

  return (
    <PageHeader
      sx={{
        alignItems: 'flex-start'
      }}
      start={
        <div>
          <Button
            variant="text"
            disableElevation
            disableRipple
            disableFocusRipple
            disableTouchRipple
            onClick={() => {
              navigate(-1)
            }}
            startIcon={
              <CustomIcon
                stopPropagation={false}
                name={'LUCIDE_ICONS'}
                icon="LuArrowLeft"
                color="primary"
              />
            }
          >
            <CustomTypography textTransform={'none'}>Back</CustomTypography>
          </Button>
        </div>
      }
    />
  )
}

export default AboutHeader
