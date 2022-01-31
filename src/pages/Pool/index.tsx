import { Trans } from '@lingui/macro'
import axios from 'axios'
import { ButtonGray, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { NewMenu } from 'components/Menu'
import { SwapPoolTabs } from 'components/NavigationTabs'
import PositionList from 'components/PositionList'
import { RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useV3Positions } from 'hooks/useV3Positions'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWalletModalToggle } from 'state/application/hooks'
import { useUserHideClosedPositions } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { PositionDetails } from 'types/position'

import clock from '../../assets/svg/clock.svg'
import uniIcon from '../../assets/svg/uniIcon.svg'
import CTACards from './CTACards'
import { LoadingRows } from './styleds'

const baseURL = 'https://jsonplaceholder.typicode.com/posts/1'

const PageWrapper = styled(AutoColumn)`
  max-width: 870px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 500px;
  `};
`
const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  `};
`
const ButtonRow = styled(RowFixed)`
  & > *:not(:last-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    flex-direction: row-reverse;
  `};
`
const Menu = styled(NewMenu)`
  margin-left: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 1 1 auto;
    width: 49%;
    right: 0px;
  `};

  a {
    width: 100%;
  }
`
const MenuItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: 500;
`
const MoreOptionsButton = styled(ButtonGray)`
  border-radius: 12px;
  flex: 1 1 auto;
  padding: 6px 8px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg0};
  margin-right: 8px;
`
const NoLiquidity = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 300px;
  padding: 80px 0;
`
const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.bg0};
  padding: 8px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
`

const NotificationBox = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1.25px solid #d6d6d6;
  margin: 0px 0 25px;
  padding-bottom: 25px;
`
const Time = styled.div`
  font-size: 12px;
  line-height: 15px;
  color: #98989e;
  margin: 0,
  display: flex,
  align-items: center,
`
const NotificationText = styled.div`
  margin: 0;
  font-size: 18px;
  line-height: 22px;
  color: #434548;
`
const NotiContent = styled.div`
  margin-left: 15px;
`
const NotificationMapWrapper = styled.div`
  padding: 30px;
`
const ClockImage = styled.img`
  margin-right: 5px;
`

function PositionsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  )
}

export default function Pool() {
  const { account, chainId } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const theme = useContext(ThemeContext)
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  const { positions, loading: positionsLoading } = useV3Positions(account)

  const [openPositions, closedPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const [messages, setMessages] = useState<IMessage[]>([])

  const click_receive = async () => {
    let result
    try {
      console.log(account)
      result = await (await axios.get(`http://localhost:4000/api/receive?to_address=${account}`)).data
      console.log(result)
    } catch (e) {}
    return result
  }

  interface IMessage {
    to_address: string
    from_address: string
    body: string
    signature: string
    date: string
  }
  const onReceive = async () => {
    const result = await click_receive()
    console.log(`received, ${result}`)

    setMessages(result)
  }

  const [notifications, setNotifications] = useState([
    {
      para: 'New Uniswap pair created: test 🦄Check out the new pool here: test ',
      time: 'September 21 at 11:32',
    },
    {
      para: 'New Uniswap pair created: test pool here: test 👯',
      time: 'September 21 at 11:32',
    },
    {
      para: 'New Uniswap pair created: test 🦄Check out the new pool here: test 👯',
      time: 'September 21 at 11:32',
    },
    {
      para: 'New Uniswap pair created: test 🦄Check out the new pool here: test 👯',
      time: 'September 21 at 11:32',
    },
  ])

  const filteredPositions = [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)]
  const showConnectAWallet = Boolean(!account)
  // const showV2Features = Boolean(chainId && V2_FACTORY_ADDRESSES[chainId])

  useEffect(() => {
    if (!showConnectAWallet) {
      axios.get(baseURL).then((response) => {
        console.log('data', response)
      })
    }
  }, [showConnectAWallet])

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <ThemedText.Body fontSize={'20px'}>
                <Trans>Notifications</Trans>
              </ThemedText.Body>
              <ButtonRow>
                <ResponsiveButtonPrimary id="join-pool-button" as={Link} to="#" onClick={onReceive}>
                  + <Trans>Get Alerts</Trans>
                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow>

            <MainContentWrapper>
              {positionsLoading ? (
                <PositionsLoadingPlaceholder />
              ) : filteredPositions && closedPositions && filteredPositions.length > 0 ? (
                <PositionList
                  positions={filteredPositions}
                  setUserHideClosedPositions={setUserHideClosedPositions}
                  userHideClosedPositions={userHideClosedPositions}
                />
              ) : (
                <>
                  {!showConnectAWallet && (
                    <>
                      <NotificationMapWrapper>
                        {messages.map((item, inex) => {
                          return (
                            <NotificationBox key={inex}>
                              <div className="notiIcon">
                                <img src={uniIcon} alt="icons" />
                              </div>
                              <NotiContent>
                                <Time>
                                  <ClockImage src={clock} alt="clock"></ClockImage> {item.date}
                                </Time>
                                <NotificationText>{item.body}</NotificationText>
                              </NotiContent>
                            </NotificationBox>
                          )
                        })}
                      </NotificationMapWrapper>
                    </>
                  )}
                  <>
                    {showConnectAWallet && (
                      <NoLiquidity>
                        <ThemedText.Body color={theme.text3} textAlign="center">
                          <div>
                            <Trans>Connect Wallet to see notifications</Trans>
                          </div>
                        </ThemedText.Body>
                        <ButtonPrimary style={{ marginTop: '2em', padding: '8px 16px' }} onClick={toggleWalletModal}>
                          <Trans>Connect a wallet</Trans>
                        </ButtonPrimary>
                      </NoLiquidity>
                    )}
                  </>
                </>
              )}
            </MainContentWrapper>
            <HideSmall>
              <CTACards />
            </HideSmall>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
