'use client'

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserIcon, CogIcon, GiftIcon, Star } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendTelegramMessage } from '@/services/TelegramService'

export default function GaverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>()
  const [sharedLink, setSharedLink] = useState("")
  const [userSharedLinks, setUserSharedLinks] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchUserSharedLinks()
    }
  }, [status, router, session])

  const fetchUserSharedLinks = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('user_shared_links')
      .select('*')
      .eq('user_email', session.user.email)
      .single()

    if (error) {
      console.error('Error fetching user shared links:', error)
    } else if (data) {
      setUserSharedLinks(data)
    }
  }

  const shareOnSocialMedia = (platform: string) => {
    const message = encodeURIComponent(`Prøv ut Innhold.AI i dag for å skrive raskere og mer effektivt med AI!`)
    let url = ''

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${message}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${message}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.origin)}&title=Innhold.AI&summary=${message}`
        break
      case 'discord':
        url = `https://discord.com/channels/@me`
        break
      case 'slack':
        url = `https://slack.com/`
        break
    }

    window.open(url, '_blank')
  }

  const saveSharedLink = async () => {
    if (!session?.user?.email || !selectedNetwork || !sharedLink) return

    const linkColumn = `link_${selectedNetwork.toLowerCase()}` as keyof typeof userSharedLinks

    console.log('Sending to Supabase:', {
      user_email: session.user.email,
      [linkColumn]: sharedLink
    })

    const { data, error } = await supabase
      .from('user_shared_links')
      .upsert({ 
        user_email: session.user.email,
        [linkColumn]: sharedLink,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_email'
      })

    if (error) {
      console.error('Error saving shared link:', error.message, error.details, error.hint)
      alert('Kunne ikke lagre lenken. Vennligst prøv igjen.')
    } else {
      setUserSharedLinks(prev => ({ ...prev, [linkColumn]: sharedLink }))
      setSharedLink("")
      setSelectedNetwork(undefined)
      alert('Lenke lagret!')

      // Send Telegram message
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      const telegramMessage = `🎁 ${session.user.email} saved ${selectedNetwork} link ${currentDate} | 2000 Ord Kampanje 🎁`;
      await sendTelegramMessage(telegramMessage);
    }
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Laster...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Få gaver</h1>

        {/* Navigation */}
        <nav className="flex justify-start mb-8 border-b border-gray-200 dark:border-gray-700">
          <Link 
            href="/profile" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <UserIcon className={`w-4 h-4 mr-2 ${pathname === '/profile' ? 'text-[#06f]' : ''}`} />
            <span>Profil</span>
          </Link>
          <Link 
            href="/profile/integration" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile/integration'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <CogIcon className={`w-4 h-4 mr-2 ${pathname === '/profile/integration' ? 'text-[#06f]' : ''}`} />
            <span>Integration</span>
          </Link>
          <Link 
            href="/profile/gaver" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile/gaver'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <GiftIcon className={`w-4 h-4 mr-2 ${pathname === '/profile/gaver' ? 'text-[#06f]' : ''}`} />
            <span>Få gaver</span>
          </Link>
          <Link 
            href="/profile/affiliate" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile/affiliate'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <Star className={`w-4 h-4 mr-2 ${pathname === '/profile/affiliate' ? 'text-[#06f]' : ''}`} />
            <span>Affiliate</span>
          </Link>
        </nav>

        {/* Social Media Share */}
        <Card className="mb-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Del på sosiale medier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">Del Innhold.AI på sosiale medier</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Få 2 000 ord gratis 🎁</p>
              <div className="flex space-x-2 mb-4">
                <Button variant="outline" size="icon" className="bg-[#1DA1F2] hover:bg-[#1a91da]" onClick={() => shareOnSocialMedia('twitter')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="bg-[#1877F2] hover:bg-[#166fe5]" onClick={() => shareOnSocialMedia('facebook')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="bg-[#0A66C2] hover:bg-[#094c8f]" onClick={() => shareOnSocialMedia('linkedin')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="bg-[#7289DA] hover:bg-[#5f73bc]" onClick={() => shareOnSocialMedia('discord')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="bg-[#4A154B] hover:bg-[#3e1240]" onClick={() => shareOnSocialMedia('slack')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Select onValueChange={setSelectedNetwork} value={selectedNetwork}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Velg nettverk" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700">
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  value={sharedLink}
                  onChange={(e) => setSharedLink(e.target.value)}
                  placeholder={
                    !selectedNetwork ? 'Velg nettverk først' :
                    userSharedLinks[`link_${selectedNetwork.toLowerCase()}`] === 'OK' ? 'Du har fått 2 000 ord' :
                    userSharedLinks[`link_${selectedNetwork.toLowerCase()}`] ? 'Under behandling' :
                    selectedNetwork === 'twitter' ? 'Lim inn lenke til Twitter-innlegget' :
                    selectedNetwork === 'facebook' ? 'Lim inn lenke til Facebook-innlegget' :
                    selectedNetwork === 'linkedin' ? 'Lim inn lenke til LinkedIn-innlegget' :
                    selectedNetwork === 'discord' ? 'Lim inn lenke til Discord-meldingen' :
                    selectedNetwork === 'slack' ? 'Lim inn lenke til Slack-meldingen' :
                    'Lim inn lenke her'
                  }
                  className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={!selectedNetwork || Boolean(userSharedLinks[`link_${selectedNetwork?.toLowerCase() ?? ''}`])}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <p>Last opp lenken til innlegget du har delt. Vi undersøker den innen 24 timer og gir deg 2 000 ord gratis</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button 
                  onClick={saveSharedLink} 
                  disabled={!selectedNetwork || !sharedLink || Boolean(userSharedLinks[`link_${selectedNetwork?.toLowerCase() ?? ''}`])}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Lagre
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}