'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from '../../lib/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AffiliateStats {
  affiliate_link: string;
  total_clicks: number;
  total_signups: number;
}

interface ActivityData {
  date: string;
  clicks: number;
  signups: number;
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
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null)
  const [activityData, setActivityData] = useState<ActivityData[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchAffiliateStats()
      fetchActivityData()
    }
  }, [status, router, session])

  const fetchAffiliateStats = async () => {
    if (!session?.user?.email) return

    const { data, error } = await supabase
      .from('affiliate_stats')
      .select('affiliate_link, total_clicks, total_signups')
      .eq('user_email', session.user.email)
      .single()

    if (error) {
      console.error('Feil ved henting av affiliate-statistikk:', error)
    } else {
      setAffiliateStats(data)
    }
  }

  const fetchActivityData = async () => {
    if (!session?.user?.email) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('affiliate_activity')
      .select('action_type, created_at')
      .eq('user_email', session.user.email)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Feil ved henting av aktivitetsdata:', error)
    } else {
      const aggregatedData: { [key: string]: ActivityData } = {}

      data.forEach((activity) => {
        const date = new Date(activity.created_at).toISOString().split('T')[0]
        if (!aggregatedData[date]) {
          aggregatedData[date] = { date, clicks: 0, signups: 0 }
        }
        if (activity.action_type === 'click') {
          aggregatedData[date].clicks++
        } else if (activity.action_type === 'signup') {
          aggregatedData[date].signups++
        }
      })

      setActivityData(Object.values(aggregatedData))
    }
  }

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

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Din Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-800 dark:text-gray-200"><strong>Navn:</strong> {session.user?.name}</p>
            <p className="mb-4 text-gray-800 dark:text-gray-200"><strong>E-post:</strong> {session.user?.email}</p>
          </CardContent>
        </Card>

        {/* Affiliate Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Din Affiliate-lenke</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliateStats?.affiliate_link ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={affiliateStats.affiliate_link}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <Button onClick={copyAffiliateLink} className="bg-blue-500 hover:bg-blue-600 text-white">
                  Kopier
                </Button>
              </div>
            ) : (
              <Button onClick={generateAffiliateLink} className="bg-green-500 hover:bg-green-600 text-white">
                Aktiver Affiliate-lenke
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Affiliate Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Din Affiliate-statistikk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-800 dark:text-gray-200"><strong>Totale klikk:</strong> {affiliateStats?.total_clicks || 0}</p>
            <p className="mb-4 text-gray-800 dark:text-gray-200"><strong>Totale registreringer:</strong> {affiliateStats?.total_signups || 0}</p>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitetsdiagram</CardTitle>
            <CardDescription>Siste 30 dager</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={activityData.slice(-30)}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit' })}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="clicks" fill="var(--color-clicks)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
                <Bar dataKey="signups" fill="var(--color-signups)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {trend.isUp ? 'Økende' : 'Synkende'} med {trend.percentage}% denne måneden 
              {trend.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div className="leading-none text-muted-foreground">
              Viser totale besøk og registreringer for de siste 30 dagene
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}