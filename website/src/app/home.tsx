import { Connect } from './wallet/connect';
import Image from 'next/image';
import Logo from '@/assets/images/EZ_Split.png';

export default function Home() {
    return (
        <>
            <div className='flex flex-col items-center justify-center h-screen'>
                <div className='flex flex-col items-center justify-center'>
                    <Image src={Logo} alt='Logo' className='h-1/3 w-auto'/>
                    <p className='text-2xl m-6 font-thin'>Splitting Crypto Payments <span className='text-orange font-extrabold'>Seamlessly</span></p>
                    <Connect />
                </div>
            </div>
        </>
    );
}