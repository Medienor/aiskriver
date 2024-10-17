'use client'

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserIcon, CogIcon, GiftIcon, ChevronDown, ChevronUp, Star } from 'lucide-react'

export default function WordPressIntegration() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [wordpressDomain, setWordpressDomain] = useState('')
  const [username, setUsername] = useState('')
  const [applicationPassword, setApplicationPassword] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchWordPressConnection()
    }
  }, [status, router, session])

  const fetchWordPressConnection = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('wordpress_connections')
      .select('*')
      .eq('user_email', session.user.email)
      .single()

    if (error) {
      console.error('Feil ved henting av WordPress-tilkobling:', error)
    } else if (data) {
      setWordpressDomain(data.wordpress_domain)
      setUsername(data.username)
      setIsConnected(true)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('wordpress_connections')
      .upsert({
        user_email: session.user.email,
        wordpress_domain: wordpressDomain,
        username: username,
        application_password: applicationPassword
      })

    if (error) {
      console.error('Feil ved tilkobling til WordPress:', error)
      alert('Kunne ikke koble til WordPress. Vennligst prøv igjen.')
    } else {
      setIsConnected(true)
      setApplicationPassword('') // Tøm passordet fra tilstanden
      alert('Vellykket tilkobling til WordPress!')
    }
  }

  const handleDisconnect = async () => {
    if (!session?.user?.email) return

    const { error } = await supabase
      .from('wordpress_connections')
      .delete()
      .eq('user_email', session.user.email)

    if (error) {
      console.error('Feil ved frakobling av WordPress:', error)
      alert('Kunne ikke koble fra WordPress. Vennligst prøv igjen.')
    } else {
      setIsConnected(false)
      setWordpressDomain('')
      setUsername('')
      setApplicationPassword('')
      alert('Vellykket frakobling fra WordPress!')
    }
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Laster...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">WordPress-integrasjon</h1>
        
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
            <span>Integrasjon</span>
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
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span className="font-medium text-gray-900 dark:text-white">WordPress</span>
                <div className="flex items-center">
                  {!isConnected && !isExpanded && (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} 
                      className="mr-2 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Koble til
                    </Button>
                  )}
                  {isConnected && !isExpanded && (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); handleDisconnect(); }} 
                      className="mr-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Koble fra
                    </Button>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              {isExpanded && (
                <div className="p-4">
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Du må koble til en bruker som har rollen Forfatter, Redaktør eller Administrator. Vi anbefaler å bruke Redaktør- eller Administrator-rollen fordi noen funksjoner ikke vil fungere perfekt med en Forfatter. Du må også bruke et Applikasjonspassord, ikke et vanlig passord. Du kan enkelt opprette et Applikasjonspassord på Profil-siden eller når du redigerer en Bruker i WordPress Admin (<a href="https://www.youtube.com/watch?v=bsz6hb1EUMY&pp=ygUeV29yZHByZXNzIGFwcGxpY2F0aW9uIHBhc3N3b3Jk" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">se video her</a>). For domenet må du bare inkludere domenenavnet som &quot;google.com&quot; og ikke &quot;https://google.com/&quot;
                  </p>
                  {isConnected ? (
                    <div>
                      <p className="mb-4 text-gray-800 dark:text-gray-200">Du er koblet til WordPress på {wordpressDomain}</p>
                      <Button onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white">Koble fra</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleConnect} className="space-y-4">
                      <div>
                        <label htmlFor="wordpress-domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">WordPress-nettstedets domene</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            https://
                          </span>
                          <Input
                            id="wordpress-domain"
                            type="text"
                            value={wordpressDomain}
                            onChange={(e) => setWordpressDomain(e.target.value)}
                            required
                            className="flex-1 rounded-none rounded-r-md"
                            placeholder="google.com"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sørg for at nettstedet ditt ikke blokkerer den innebygde WordPress REST API. Som et minimum må &quot;/wp-json/wp/v2/posts&quot;-endepunktet være tilgjengelig.</p>
                      </div>
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">WordPress-brukernavn</label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="mt-1"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Du må bruke brukernavnet til en WordPress-bruker med rollen Forfatter, Redaktør eller Administrator. Ikke bruk navnet på Applikasjonspassordet. Vi anbefaler å bruke Redaktør- eller Administrator-rollen fordi noen funksjoner ikke vil fungere perfekt med en Forfatter.</p>
                      </div>
                      <div>
                        <label htmlFor="application-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">WordPress Applikasjonspassord</label>
                        <Input
                          id="application-password"
                          type="password"
                          value={applicationPassword}
                          onChange={(e) => setApplicationPassword(e.target.value)}
                          required
                          className="mt-1"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Dette må være et Applikasjonspassord - ikke det vanlige passordet som brukes til å logge inn! Det ser slik ut: E66J cCGF vxcM eraH PtLD 66X1. Se meldingen ovenfor for mer informasjon om hvordan du oppretter et.</p>
                      </div>
                      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Legg til konto</Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}