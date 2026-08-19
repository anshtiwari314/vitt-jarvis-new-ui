import DataWrapper from '../context/DataWrapper'
import VadWrapper from '../context/VadWrapper'
import { MainPageWakeWordProvider } from '../context/MainPageWakeWordContext'
import MainInsurancePage from '../pages/MainInsurancePage'
import MainPageWakeWordGate from '../components/MainPageWakeWordGate'

export default function MainPageRoute() {
  return (
    <DataWrapper>
      <VadWrapper>
        <MainPageWakeWordProvider>
          <MainPageWakeWordGate />
          <MainInsurancePage />
        </MainPageWakeWordProvider>
      </VadWrapper>
    </DataWrapper>
  )
}
