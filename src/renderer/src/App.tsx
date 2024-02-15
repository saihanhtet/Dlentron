import Authenticate from './components/Authenticate'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import { useEffect } from 'react'
import { checkToken } from './requestJS'

function App(): JSX.Element {
  useEffect(() => {
    const checkSessionId = async () => {
      console.log('Checking session...')
      try {
        const { success, response } = await checkToken()
        if (success) {
          console.log(response)
        } else {
          console.log('session is dead')
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        console.log('end loading')
      }
    }

    checkSessionId()
  }, [])
  return (
    <div className="container">
      <Authenticate />
    </div>
  )
}

export default App
