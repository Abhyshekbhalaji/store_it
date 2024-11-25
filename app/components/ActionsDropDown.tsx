'use client';
import React, { useState } from 'react'

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import Image from 'next/image';
import { Models } from 'node-appwrite';
import { actionsDropdownItems } from '../constants';
import Link from 'next/link';

import { constructDownloadUrl } from '@/lib/utils';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    
  } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { deleteFileUsers, renameFile, updateFileUsers } from '@/lib/actions/file.actions';
import { usePathname } from 'next/navigation';
import { FileDetails, ShareInput } from './ActionsModelContent';

  
const ActionsDropDown = ({file}:Models.Document) => {

    const [isModal,setIsModalOpen]=useState(false);
    const [isDropdownOpen,setIsDropdownOpen]=useState(false);
    const [act,setAct]=useState<ActionType | null>(null);
    const [name,setName]=useState(file.name);
    const[isLoading,setIsLoading]=useState(false);
   const [emails,setEmails]=useState<string[]>([]);
    const path=usePathname();
    
    
    const closeAllModals=()=>{
        setIsModalOpen(false);
        setIsDropdownOpen(false)
        setAct(null)

    }

    const handleRemoveUser=async(email:string)=>{
      const updatedEmails=emails.filter((e)=>e!==email)
      const success=await updateFileUsers({
        fileId:file.$id,
        emails:updatedEmails,
        path
      })
      if(success){
        setEmails(updatedEmails);
        closeAllModals();
      }
    }

    const handleAction=async()=>{
        if(!act){
            return ;
        }
        setIsLoading(true);
        let success=false;
        const actions={
            rename:()=>renameFile({fileId:file.$id,name,extension:file.extension,
                path
            }),
            share:()=>updateFileUsers({fileId:file.$id,emails,path}),
           delete:()=>deleteFileUsers({
            fileId:file.$id,
            path,
            bucketFileId:file.bucketFileId
           }),
        }
           success=await actions[act.value as keyof typeof actions]();
           if(success){
                closeAllModals();

           }
           setIsLoading(false);
        
    }
    const renderDialogContent=()=>{
            if(!act){
                return null
            }
            const {value,label}=act
       return (
    
  <DialogContent className='shad-dialog button'>
    <DialogHeader className='flex flex-col gap-3'>
      <DialogTitle className='text-center text-light-100'>{label}</DialogTitle>
    
        {value==='rename' && (
            <Input type="text"
            value={name} className='text-black' onChange={(e)=>{
                setName(e.target.value)
            }}
             />
        )}

      {value==='details' && (<FileDetails file={file} />)}
      {value==='share' && (
        <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUser} />
      )}

      {
        value==='delete' && (
          <p className='delete-confirmation'>
            Are you sure you want to delete {` `}
            <span className='delete-file-name'>{file.name}</span>?

          </p>
        )
      }


    </DialogHeader>
    {['rename','delete','share'].includes(value) && (
        <DialogFooter className='flex flex-col gap-3 md:flex-row'>
            <Button onClick={closeAllModals} className='modal-cancel-button'>
            Cancel 
            </Button>
            <Button className='modal-submit-button' onClick={handleAction}>
                <p className='capitalize'>{value}</p>
                {isLoading && <Image src="/assets/icons/loader.svg" 
                alt="loader"
                width={24}
                height={24}
                className='animate-spin'
                />}
            </Button>
        </DialogFooter>
    )}
  </DialogContent>

       )
    }
  return (
    <>
        <Dialog open={isModal} onOpenChange={setIsModalOpen}>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className='shad-no-focus'>
        <Image src='/assets/icons/dots.svg' alt='dots' width={34} height={34}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuLabel className='max-w-[200px] truncate'>{file.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
           {actionsDropdownItems.map((action)=>(
            <DropdownMenuItem key={action.value} className='shad-dropdown-item' onClick={()=>{
                setAct(action);
                if(['rename','share','delete','details'].includes(action.value)){
                    setIsModalOpen(true);
                }
            }}>
              {action.value==='download'?<Link href={constructDownloadUrl(file.bucketFileId)} download={file.name} className='flex items-center gap-2'><Image src={action.icon} alt={action.label} width={30} height={30}/>{action.label} </Link> : <div className='flex items-center gap-2'>
              <Image src={action.icon} alt={action.label} width={30} height={30}/>
              {action.label}   
                </div>} 
                
            </DropdownMenuItem>
           ))}
        </DropdownMenuContent>
        </DropdownMenu>
        {renderDialogContent()}

        </Dialog>

    </>
  )
}

export default ActionsDropDown