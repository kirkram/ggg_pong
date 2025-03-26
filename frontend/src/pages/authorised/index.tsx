import { useAppInfo } from "../../context"

export const Dashboard = () => {
    const appInfo = useAppInfo()

    return (
         <div>This is dashboard {JSON.stringify(appInfo)}
            <button onClick={ () => { 
                localStorage.removeItem('ping-pong-jwt') 
                window.location.reload()
                }}>Logout</button>
         </div>
    )
}