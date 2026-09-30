import { useState } from 'react'
import { Button } from '../ui/button'
import { Compass, LogOut, MapPinned, Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';

function Header() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [openDialog, setOpenDialog] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error)
  })

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo.access_token}`,
        Accept: 'application/json',
      },
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      window.location.reload();
    }).catch((error) => {
      console.error("Error fetching user profile: ", error);
    });
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="/" className="brand-link" aria-label="Roamly home">
          <img src="/logo.svg" alt="" />
          <span className="brand-name">Roamly<small>Travel studio</small></span>
        </a>
        {user ?
          <div className="header-actions">
            <nav className="header-nav" aria-label="Main navigation">
              <a href="/create-trip"><Plus size={16} />Create trip</a>
              <a href="/my-trips"><MapPinned size={16} />My trips</a>
            </nav>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="header-avatar-button" aria-label="Open account menu">
                  {user?.picture ? <img src={user.picture} alt="" /> : <Compass size={19} />}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44">
                <button type="button" className="flex w-full items-center gap-2 text-sm" onClick={()=>{
                  googleLogout();
                  localStorage.removeItem('user');
                  window.location.assign('/');
                }}><LogOut size={15} />Sign out</button>
              </PopoverContent>
            </Popover>
          </div> : <Button className="header-primary" onClick={()=>setOpenDialog(true)}>Sign In</Button>}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="logo" width="100px" className='items-center' />
              <h2 className='font-bold text-lg'>Sign In to check out your travel plan</h2>
              <p>Sign in to the App with Google authentication securely</p>
              <Button
                onClick={login}
                className="w-full mt-6 flex gap-4 items-center header-primary">
                <FcGoogle className="h-7 w-7" />Sign in With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </header>
  )
}

export default Header