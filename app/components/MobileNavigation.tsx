'use client';
import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { avatarPlaceholderURL, navItems } from '../constants';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import FileUploader from './FileUploader';
import { signOutUser } from '@/lib/actions/user.actions';

interface Props{
  $id:string
 ownerId:string,
accountId:string,
fullname:string,
avatar:string,
email:string
}

const MobileNavigation = ({$id,accountId,avatar,ownerId,fullname,email}:Props) => {

  const [open,setOpen]=useState(false);
  const pathName=usePathname();



  

  return (
    <header className='mobile-header'>
      <Image src="/assets/icons/logo-full-brand.svg" alt="logo" width={120} height={52} className='h-auto'/>
      <Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger>
    <Image src="/assets/icons/menu.svg"alt="Search" width={30} height={30}/>
  </SheetTrigger>
  <SheetContent className='shad-sheet h-screen px-3'>
    <SheetHeader>
      <SheetTitle>
        <div className='header-user'>

          <Image src={avatarPlaceholderURL} alt="avatar" width={44} height={44} className='header-user-avatar'/>
      <div className='sm:hidden lg:block'>
      <p className='subtitle-2 capitalize'>{fullname}</p>
      <p className='caption'>{email}</p>
      </div>
        </div>
        <Separator className='mb-4 bg-light-200/20'/>
      </SheetTitle>
     <nav className='mobile-nav'>
      <ul className='mobile-nav-list'>
      {navItems.map(({url,name,icon})=>{
      const active=pathName===url;
     return (<Link key={name} href={url} className='lg:w-full'>
        <li className={cn("sidebar-nav-item",active && 'shad-active')}>
          <Image src={icon} alt={name} width={24} height={24} className={cn('nav-icon' ,pathName===url && 'nav-icon-active')}/>
          <p>{name}</p>
        </li>
      </Link>)
    })}
      </ul>
     </nav>

     <Separator className='my-5 bg-light-200/20 ' />

     <div className='flex flex-col justify-between gap-5 pb-5'>
      <FileUploader ownerId={$id} accountId={accountId} />
      <Button type="submit" className='mobile-sign-out-button' onClick={async()=>(await signOutUser())}>
              <Image src="/assets/icons/logout.svg" alt="logo" width={24} height={24} /> Logout 
            </Button>
     </div>
    </SheetHeader>
  </SheetContent>
</Sheet>
    </header>
  )
}

export default MobileNavigation