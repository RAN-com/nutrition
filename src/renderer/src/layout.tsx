import { styled, Tooltip } from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'
import CustomIcon from './components/icons'
import CustomTypography from './components/typography'
import Icon from './assets/icon.png'

type Props = {
  children?: React.ReactNode
}

const getTitle = () => {
  let title = ''
  if (typeof window !== 'undefined' && window.document) {
    if (document.title.includes('Electron')) {
      title = 'Nutrition'
    } else {
      title = document.title
    }
  } else {
    title = 'Nutrition'
  }
  return title
}

const Layout: React.FC<Props> = ({ children }) => {
  const title = getTitle()
  const handleQuit = () => {
    window.electron?.ipcRenderer.send('updateResponse', 'quit_app')
  }

  const handleMinimize = () => {
    window.electron?.ipcRenderer?.send('updateResponse', 'minimize_app')
  }

  return (
    <Container
      style={{
        height: window.screen.availHeight
      }}
    >
      {/* <TabBar>
        <TabBarTitleContainer>
          <img src={Icon} alt={'Nutrition'} />
          <CustomTypography variant="body2" color={grey['200']}>
            {title}
          </CustomTypography>
        </TabBarTitleContainer>
        <TabBarButtonContainer onClick={handleMinimize}>
          <Tooltip title={'Minimize'} followCursor={true}>
            <TabBarContainer className="minimize">
              <CustomIcon
                stopPropagation={false}
                name="LUCIDE_ICONS"
                icon="LuMinus"
                size={18}
                color={'#ffffffaa'}
              />
            </TabBarContainer>
          </Tooltip>
          <Tooltip title={'Close'} followCursor={true} onClick={handleQuit}>
            <TabBarContainer className="exit">
              <CustomIcon
                stopPropagation={false}
                name="LUCIDE_ICONS"
                icon="LuX"
                size={18}
                color={'#ffffffaa'}
              />
            </TabBarContainer>
          </Tooltip>
        </TabBarButtonContainer>
      </TabBar> */}
      <MainContainer>{children}</MainContainer>
    </Container>
  )
}

export default Layout

const Container = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '1fr'
})

const TabBar = styled('div')({
  width: '100%',
  height: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr 100px',
  gridTemplateRows: '1fr',
  backgroundColor: '#0a1f04f6',
  // borderRadius: '20px',
  paddingLeft: '12px',
  paddingRight: '12px',
  boxShadow: 'none'
})

const TabBarTitleContainer = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: '12px',
  gap: 8,
  '& img': {
    maxHeight: '20px',
    height: '100%',
    borderRadius: 4,
    objectFit: 'contain'
  }
})

const TabBarButtonContainer = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 12
})

const TabBarContainer = styled('span')({
  width: 'calc(100%)',
  height: 'calc(100%)',
  display: 'flex',
  maxHeight: '32px',
  maxWidth: '32px',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all .3s',
  borderRadius: 100,
  '&:hover': {
    backgroundColor: '#b9b9b92b'
  }
  // '&.exit': {
  //   backgroundColor: red['900'],
  //   '&:hover': {
  //     backgroundColor: red['700']
  //   }
  // },
  // '&.minimize': {
  //   backgroundColor: grey['300'] + 'aa',
  //   '&:hover': {
  //     backgroundColor: grey['200'] + 'aa'
  //   }
  // }
})

const MainContainer = styled('div')({
  width: '100%',
  height: '100%'
})
