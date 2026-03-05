import React, { createContext, useEffect, useState } from "react"
import {getAuthToken} from "./auth"
import {jwtDecode} from "jwt-decode"

const DataContext = createContext({})


export const DataProvider = ({children}) => {
   
        const [userData, setUserData] = useState({})
        const token = getAuthToken()
        useEffect(()=>{
            if(token){
                fetchData()
            }
    },[token])
        
       const fetchData = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const sessionToken = localStorage.getItem("sessionToken");

            const decodeToken = jwtDecode(token);

            const response = await fetch(
            process.env.REACT_APP_BACKENDURL + "/api/user/" + decodeToken.id,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                "session-token": sessionToken
                }
            }
            );

            const resData = await response.json();

            if (!response.ok) {
            console.log("error");
            } else {
            setUserData(resData);
            }

        } catch (err) {
            console.log("Network Error");
        }
        };
                        
        return(
            <DataContext.Provider value={{
                userData, token
            }}>
                {children}
            </DataContext.Provider>
        )
       
}
export default DataContext