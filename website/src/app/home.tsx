import { Connect } from './wallet/connect';
import Image from 'next/image';
import Logo from '@/assets/images/EZ_Split.png';

export default function Home() {
    return (
        <>
            <div className="bodyBackground flex items-center justify-center h-screen px-8 w-screen flex-col">
                {/* Image on the left */}
                <div className="mr-0 h-1/5 w-screen p-5">
                    <Image src={Logo} alt="Logo" className="h-24 w-auto" />
                </div>

                {/* Text in the center */}
                <div className="flex flex-col items-center h-4/5 w-screen justify-center mb-10 pb-10">
                    <p className="text-6xl font-thin text-center">
                        Splitting Crypto Payments <br />
                        <span className="text-orange font-extrabold block">Seamlessly</span>
                    </p>

                    {/* Button below */}
                    <div className="mt-8">
                        <Connect />
                    </div>
                </div>
            </div>
        </>
    );
}
