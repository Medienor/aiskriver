'use client'

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, UserIcon, CogIcon, GiftIcon, LinkIcon, MonitorIcon, Gift, Star, MessageCircle } from 'lucide-react'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, addMonths, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

interface AffiliateStats {
  affiliate_link: string;
  affiliate_clicks: number;
  total_signups: number;
  affiliate_code: string;  // Add this line
}

interface ActivityData {
  date: string;
  clicks: number;
  signups: number;
}

interface ReferredCustomer {
  referred_email: string;
  created_at: string;
}

function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const chartConfig = {
  clicks: {
    label: "Klikk",
    color: "hsl(var(--chart-1))",
  },
  signups: {
    label: "Registreringer",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function AffiliatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null)
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [expectedPayout, setExpectedPayout] = useState(0)
  const [referredCustomers, setReferredCustomers] = useState<ReferredCustomer[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const customersPerPage = 10
  const [commissions, setCommissions] = useState<any[]>([])
  const [totalCommissions, setTotalCommissions] = useState(0)
  const [pendingPayouts, setPendingPayouts] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchAffiliateStats()
      fetchActivityData()
      fetchReferredCustomers()
      fetchCommissions()
      fetchCommissionSummary()
    }
  }, [status, router, session])

  const fetchAffiliateStats = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('affiliate_stats')
      .select('affiliate_link, affiliate_clicks, total_signups, affiliate_code')  // Add affiliate_code here
      .eq('user_email', session.user.email)
      .single()

    if (error) {
      console.error('Feil ved henting av affiliate-statistikk:', error)
    } else {
      setAffiliateStats(data as AffiliateStats)  // Add type assertion here
    }
  }

  const fetchActivityData = async () => {
    if (!session?.user?.email) return

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('affiliate_activity')
      .select('action_type, created_at')
      .eq('user_email', session.user.email)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Feil ved henting av aktivitetsdata:', error)
    } else {
      const aggregatedData: { [key: string]: ActivityData } = {}

      // Initialize all days of the current month
      for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0]
        aggregatedData[dateString] = { date: dateString, clicks: 0, signups: 0 }
      }

      // Populate with actual data
      data.forEach((activity) => {
        const date = new Date(activity.created_at).toISOString().split('T')[0]
        if (activity.action_type === 'click') {
          aggregatedData[date].clicks++
        } else if (activity.action_type === 'signup') {
          aggregatedData[date].signups++
        }
      })

      setActivityData(Object.values(aggregatedData))
    }
  }

  const fetchReferredCustomers = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('affiliate_activity')
      .select('referred_email, created_at')
      .eq('user_email', session.user.email)
      .eq('action_type', 'signup')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referred customers:', error)
    } else {
      setReferredCustomers(data || [])
    }
  }

  const fetchCommissions = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_code', affiliateStats?.affiliate_code)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching commissions:', error)
    } else {
      setCommissions(data || [])
    }
  }

  const fetchCommissionSummary = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('affiliate_commissions')
      .select('amount, status')
      .eq('affiliate_code', affiliateStats?.affiliate_code)

    if (error) {
      console.error('Error fetching commission summary:', error)
    } else {
      const total = data.reduce((sum, commission) => sum + commission.amount, 0)
      const pending = data
        .filter(commission => commission.status === 'pending')
        .reduce((sum, commission) => sum + commission.amount, 0)

      setTotalCommissions(total)
      setPendingPayouts(pending)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchAffiliateStats()
      fetchActivityData()
      fetchReferredCustomers()
      fetchCommissions()
      fetchCommissionSummary()
    }
  }, [status, session])

  const copyAffiliateLink = () => {
    if (affiliateStats?.affiliate_link) {
      navigator.clipboard.writeText(affiliateStats.affiliate_link)
      alert('Affiliate-lenke kopiert til utklippstavlen!')
    }
  }

  const generateAffiliateLink = async () => {
    if (!session?.user?.email) return

    const randomCode = generateRandomCode();
    const affiliateLink = `${window.location.origin}/auth?ref=${randomCode}`

    const { data, error } = await supabase
      .from('affiliate_stats')
      .upsert({ 
        user_email: session.user.email, 
        affiliate_link: affiliateLink,
        affiliate_code: randomCode,
        total_clicks: 0,
        total_signups: 0
      })
      .select()

    if (error) {
      console.error('Feil ved generering av affiliate-lenke:', error)
      alert('Kunne ikke generere affiliate-lenke. Vennligst prøv igjen.')
    } else {
      setAffiliateStats(data[0])
      alert('Affiliate-lenke generert!')
    }
  }

  const calculateTrend = () => {
    if (activityData.length < 2) return { percentage: 0, isUp: true };
    const lastMonth = activityData.slice(-30);
    const thisMonth = lastMonth.slice(-15);
    const lastMonthTotal = lastMonth.reduce((sum, day) => sum + day.clicks + day.signups, 0);
    const thisMonthTotal = thisMonth.reduce((sum, day) => sum + day.clicks + day.signups, 0);
    const percentage = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    return { 
      percentage: Math.abs(Number(percentage.toFixed(1))), 
      isUp: percentage > 0 
    };
  }

  const calculateExpectedPayout = () => {
    // This is a placeholder calculation. Adjust according to your actual commission structure.
    const commission = (affiliateStats?.total_signups || 0) * 100 // Assuming 100 NOK per signup
    setExpectedPayout(commission)
  }

  useEffect(() => {
    if (affiliateStats) {
      calculateExpectedPayout()
    }
  }, [affiliateStats])

  const nextMonth = format(addMonths(new Date(), 1), 'MMMM', { locale: nb })

  const CustomBar = (props: any) => {
    const { x, y, width, height, fill, dataKey, payload } = props;
    const today = new Date().toISOString().split('T')[0];
    const isFutureDate = payload.date && payload.date > today;
    const opacity = isFutureDate ? 0.3 : 1;
    return <rect x={x} y={y} width={width} height={height || 1} fill={fill} fillOpacity={opacity} />;
  };

  const maskEmail = (email: string | null) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    return localPart ? `***@${domain}` : '';
  }

  const indexOfLastCustomer = currentPage * customersPerPage
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage
  const currentCustomers = referredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Laster...</div>
  }

  if (!session) {
    return null
  }

  const trend = calculateTrend();

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Affiliate-dashbord</h1>

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

        {/* Affiliate Link - New Design (Full Width) */}
        <Card className="mb-8 bg-blue-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Tjen 30% i kommisjon</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6 relative">
              <div className="flex flex-col items-center text-center max-w-[100px] z-10">
                <div className="bg-white dark:bg-gray-700 p-2 rounded-full mb-2 border border-blue-200 dark:border-blue-600">
                  <LinkIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Send din henvisningslenke til dine venner</p>
              </div>
              <div className="flex flex-col items-center text-center max-w-[100px] z-10">
                <div className="bg-white dark:bg-gray-700 p-2 rounded-full mb-2 border border-blue-200 dark:border-blue-600">
                  <MonitorIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Dine venner registrerer seg for en konto</p>
              </div>
              <div className="flex flex-col items-center text-center max-w-[100px] z-10">
                <div className="bg-white dark:bg-gray-700 p-2 rounded-full mb-2 border border-blue-200 dark:border-blue-600">
                  <Gift className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Både du og dine venner vil motta belønninger</p>
              </div>
              <div className="absolute top-5 left-0 right-0 border-t-2 border-dashed border-blue-300 dark:border-blue-600" />
            </div>
            <div className="flex items-center">
              {affiliateStats?.affiliate_link ? (
                <>
                  <Input 
                    value={affiliateStats.affiliate_link}
                    readOnly 
                    className="flex-grow mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Button onClick={copyAffiliateLink} className="bg-blue-500 hover:bg-blue-600 text-white">Kopier</Button>
                </>
              ) : (
                <Button onClick={generateAffiliateLink} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Generer Affiliate-lenke
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expected Payout Box */}
        <Card className="bg-white dark:bg-gray-800 mb-4">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Forventet utbetaling {nextMonth}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingPayouts.toFixed(2)} NOK</p>
          </CardContent>
        </Card>

        {/* Affiliate Stats and Activity Chart */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate-statistikk</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Denne måneden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="mb-2 text-gray-800 dark:text-gray-200">
                <strong>Totale klikk:</strong> {affiliateStats?.affiliate_clicks || 0}
              </p>
              <p className="mb-2 text-gray-800 dark:text-gray-200">
                <strong>Totale registreringer:</strong> {affiliateStats?.total_signups || 0}
              </p>
            </div>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={activityData}
                margin={{
                  top: 20,
                  right: 0,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="5 5" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: 'var(--chart-text-color)' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('no-NO', { day: '2-digit' })}
                />
                <YAxis tick={{ fill: 'var(--chart-text-color)' }} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="clicks" fill="var(--color-clicks)" radius={8} shape={<CustomBar />}>
                  <LabelList
                    dataKey="clicks"
                    position="top"
                    fill="var(--chart-text-color)"
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>
                <Bar dataKey="signups" fill="var(--color-signups)" radius={8} shape={<CustomBar />}>
                  <LabelList
                    dataKey="signups"
                    position="top"
                    fill="var(--chart-text-color)"
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex gap-2 font-medium leading-none">
              {trend.isUp ? 'Økende' : 'Synkende'} med {trend.percentage}% denne måneden 
              {trend.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div className="leading-none text-muted-foreground">
              Viser totale besøk og registreringer for denne måneden
            </div>
          </CardFooter>
        </Card>

        {/* Referred Customers Table */}
        <Card className="mt-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Dine kunder</CardTitle>
          </CardHeader>
          <CardContent>
            {referredCustomers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">E-post</th>
                        <th scope="col" className="px-6 py-3">Registrert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCustomers.map((customer, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{maskEmail(customer.referred_email)}</td>
                          <td className="px-6 py-4">
                            {customer.created_at ? formatDistanceToNow(new Date(customer.created_at), { addSuffix: true, locale: nb }) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-center">
                  <nav>
                    <ul className="flex list-none">
                      {Array.from({ length: Math.ceil(referredCustomers.length / customersPerPage) }, (_, i) => (
                        <li key={i}>
                          <button
                            onClick={() => paginate(i + 1)}
                            className={`px-3 py-1 mx-1 rounded ${
                              currentPage === i + 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Ingen kunder registrert</p>
            )}
          </CardContent>
        </Card>

        {/* Commission Summary */}
        <Card className="mt-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Kommisjonsoversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Totale kommisjoner</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCommissions.toFixed(2)} NOK</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ventende utbetalinger</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayouts.toFixed(2)} NOK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commissions Table */}
        <Card className="mt-8 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Dine kommisjoner</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Dato</th>
                      <th scope="col" className="px-6 py-3">Beløp</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission, index) => (
                      <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4">{new Date(commission.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{commission.amount} NOK</td>
                        <td className="px-6 py-4">{commission.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Ingen kommisjoner registrert ennå</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}