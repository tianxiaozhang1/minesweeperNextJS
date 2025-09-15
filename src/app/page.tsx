// import Image from "next/image";
import MinesweeperGame from '../components/MinesweeperGame';

export default function Home() {
    return (
        <div className="bg-slate-100 w-full h-screen flex justify-center items-center">       
            <div>
                      
                <MinesweeperGame />
            </div>
        </div>
    );
}
