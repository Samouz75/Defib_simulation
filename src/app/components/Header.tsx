import { useState, useEffect } from "react";
import DropdownMenu from "./DropdownMenu";

export default function Header() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: 'rgba(17, 24, 39, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(55, 65, 81, 0.5)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 20px',
            zIndex: 1000 
        }}>
            <DropdownMenu />
        </div>
    );
}