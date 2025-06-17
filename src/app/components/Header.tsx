import { useState, useEffect } from "react";
import DropdownMenu from "./DropdownMenu";

interface HeaderProps {
  onStartScenario?: (scenarioId: string) => void;
}

export default function Header({ onStartScenario }: HeaderProps) {
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
            backgroundColor: 'transparent', 
            borderBottom: 'transparent', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 20px',
            zIndex: 1000 
        }}>
            <DropdownMenu onStartScenario={onStartScenario} />
        </div>
    );
}