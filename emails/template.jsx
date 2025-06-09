import * as React from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components";

export default function EmailTemplate({
    userName = "",
    type = "",
    data = {
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        stats: {
            totalIncome: 0,
            totalExpenses: 0,
            budgetAmount: 0,
            byCategory: {},
            previousMonthIncome: 0,
            previousMonthExpenses: 0
        },
        insights: []
    },
}) {
    // Validate required parameters
    if (!userName || !type) {
        console.error('Missing required parameters: userName and type are required');
        return null;
    }

    // Validate data structure
    if (!data || typeof data !== 'object') {
        console.error('Invalid data structure provided');
        return null;
    }

    // Ensure stats object exists
    if (!data.stats) {
        data.stats = {
            totalIncome: 0,
            totalExpenses: 0,
            budgetAmount: 0,
            byCategory: {},
            previousMonthIncome: 0,
            previousMonthExpenses: 0
        };
    }

    // Ensure insights array exists
    if (!data.insights) {
        data.insights = [];
    }

    // Ensure month and year exist
    if (!data.month) {
        data.month = new Date().toLocaleString('default', { month: 'long' });
    }
    if (!data.year) {
        data.year = new Date().getFullYear();
    }

    if (type === "monthly-report") {
        return (
            <Html>
              <Head />
              <Preview>Your Monthly Financial Report</Preview>
              <Body style={styles.body}>
                <Container style={styles.container}>
                  <Heading style={styles.title}>Monthly Financial Report</Heading>
      
                  <Text style={styles.text}>Hello {userName},</Text>
                  <Text style={styles.text}>
                    Here&rsquo;s your financial summary for {data?.month} {data?.year}:
                  </Text>
      
                  {/* Main Stats */}
                  <Section style={styles.statsContainer}>
                    <div style={styles.stat}>
                      <Text style={styles.statLabel}>Total Income</Text>
                      <Text style={styles.statValue}>${data?.stats?.totalIncome?.toLocaleString() || 0}</Text>
                      {data?.stats?.previousMonthIncome && (
                        <Text style={styles.comparison}>
                          {data.stats.totalIncome > data.stats.previousMonthIncome ? '↑' : '↓'} 
                          {Math.abs(((data.stats.totalIncome - data.stats.previousMonthIncome) / data.stats.previousMonthIncome) * 100).toFixed(1)}% vs last month
                        </Text>
                      )}
                    </div>
                    <div style={styles.stat}>
                      <Text style={styles.statLabel}>Total Expenses</Text>
                      <Text style={styles.statValue}>${data?.stats?.totalExpenses?.toLocaleString() || 0}</Text>
                      {data?.stats?.previousMonthExpenses && (
                        <Text style={styles.comparison}>
                          {data.stats.totalExpenses > data.stats.previousMonthExpenses ? '↑' : '↓'} 
                          {Math.abs(((data.stats.totalExpenses - data.stats.previousMonthExpenses) / data.stats.previousMonthExpenses) * 100).toFixed(1)}% vs last month
                        </Text>
                      )}
                    </div>
                    <div style={styles.stat}>
                      <Text style={styles.statLabel}>Net Savings</Text>
                      <Text style={styles.statValue}>
                        ${((data?.stats?.totalIncome || 0) - (data?.stats?.totalExpenses || 0)).toLocaleString()}
                      </Text>
                    </div>
                  </Section>

                  {/* Budget Progress */}
                  {data?.stats?.budgetAmount > 0 && (
                    <Section style={styles.progressSection}>
                      <Text style={styles.sectionTitle}>Budget Progress</Text>
                      <div style={styles.progressBar}>
                        <div 
                          style={{
                            ...styles.progressFill,
                            width: `${((data?.stats?.totalExpenses || 0) / data?.stats?.budgetAmount) * 100}%`,
                            backgroundColor: ((data?.stats?.totalExpenses || 0) / data?.stats?.budgetAmount) > 0.9 ? '#ef4444' : '#3b82f6'
                          }}
                        />
                      </div>
                      <div style={styles.progressStats}>
                        <Text style={styles.progressText}>
                          ${(data?.stats?.totalExpenses || 0).toLocaleString()} of ${data?.stats?.budgetAmount?.toLocaleString()} budget used
                        </Text>
                        <Text style={styles.progressPercentage}>
                          {(((data?.stats?.totalExpenses || 0) / data?.stats?.budgetAmount) * 100).toFixed(1)}%
                        </Text>
                      </div>
                    </Section>
                  )}
      
                  {/* Category Breakdown */}
                  {data?.stats?.byCategory && Object.keys(data.stats.byCategory).length > 0 && (
                    <Section style={styles.section}>
                      <Heading style={styles.heading}>Expenses by Category</Heading>
                      {Object.entries(data.stats.byCategory).map(
                        ([category, amount]) => (
                          <div key={category} style={styles.row}>
                            <Text style={styles.text}>{category}</Text>
                            <Text style={styles.text}>${amount.toLocaleString()}</Text>
                          </div>
                        )
                      )}
                    </Section>
                  )}
      
                  {/* AI Insights */}
                  {data?.insights && data.insights.length > 0 && (
                    <Section style={styles.section}>
                      <Heading style={styles.heading}>Welth Insights</Heading>
                      {data.insights.map((insight, index) => (
                        <Text key={index} style={styles.text}>
                          • {insight}
                        </Text>
                      ))}
                    </Section>
                  )}

                  {/* Action Items */}
                  <Section style={styles.actionSection}>
                    <div style={styles.buttonContainer}>
                      <Button 
                        href="http://localhost:3000/dashboard" 
                        style={styles.button}
                      >
                        View Detailed Report
                      </Button>
                    </div>
                  </Section>
      
                  <Text style={styles.footer}>
                    Thank you for using Welth. Keep tracking your finances for better
                    financial health!
                  </Text>
                </Container>
              </Body>
            </Html>
          );
    }

    if(type === "budget-alert"){
        return (
            <Html>
                <Head />
                <Preview>Budget Alert: {data.percentageUsed}% of your monthly budget has been used</Preview>
                <Body style={styles.body}>
                    <Container style={styles.container}>
                        <Section style={styles.header}>
                            <Heading style={styles.title}>Budget Alert</Heading>
                            <Text style={styles.subtitle}>{data.month} {data.year}</Text>
                        </Section>

                        <Section style={styles.content}>
                            <Text style={styles.greeting}>Hello {userName},</Text>
                            
                            <Text style={styles.message}>
                                We wanted to let you know that you've used <strong>{data.percentageUsed.toFixed(1)}%</strong> of your monthly budget. 
                                Here's a breakdown of your current spending:
                            </Text>

                            <Section style={styles.statsContainer}>
                                <div style={styles.stat}>
                                    <Text style={styles.statLabel}>Monthly Budget</Text>
                                    <Text style={styles.statValue}>${Number(data.budgetAmount).toLocaleString()}</Text>
                                </div>
                                <div style={styles.stat}>
                                    <Text style={styles.statLabel}>Spent So Far</Text>
                                    <Text style={styles.statValue}>${Number(data.totalExpenses).toLocaleString()}</Text>
                                </div>
                                <div style={styles.stat}>
                                    <Text style={styles.statLabel}>Remaining</Text>
                                    <Text style={styles.statValue}>${(Number(data.budgetAmount) - Number(data.totalExpenses)).toLocaleString()}</Text>
                                </div>
                            </Section>

                            <Section style={styles.progressContainer}>
                                <div style={styles.progressBar}>
                                    <div 
                                        style={{
                                            ...styles.progressFill,
                                            width: `${data.percentageUsed}%`,
                                            backgroundColor: data.percentageUsed > 90 ? '#ef4444' : '#3b82f6'
                                        }}
                                    />
                                </div>
                            </Section>

                            <Section style={styles.actionContainer}>
                                <Text style={styles.actionText}>
                                    {data.percentageUsed > 90 
                                        ? "You're close to exceeding your budget! Consider reviewing your expenses."
                                        : "You're on track with your budget. Keep up the good work!"}
                                </Text>
                                <Button 
                                    href="http://localhost:3000/dashboard" 
                                    style={styles.button}
                                >
                                    View Detailed Report
                                </Button>
                            </Section>
                        </Section>

                        <Hr style={styles.hr} />

                        <Section style={styles.footer}>
                            <Text style={styles.footerText}>
                                This is an automated message. Please do not reply to this email.
                            </Text>
                            <Text style={styles.footerText}>
                                To manage your notification preferences, visit your account settings.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Html>
        );
    }

    return null;
}

const styles = {
    body: {
        backgroundColor: "#f6f9fc",
        fontFamily: "-apple-system, sans-serif",
        margin: 0,
        padding: 0,
    },
    container: {
        backgroundColor: "#ffffff",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    title: {
        color: "#1f2937",
        fontSize: "32px",
        fontWeight: "bold",
        textAlign: "center",
        margin: "0 0 20px",
    },
    heading: {
        color: "#1f2937",
        fontSize: "20px",
        fontWeight: "600",
        margin: "0 0 16px",
    },
    text: {
        color: "#4b5563",
        fontSize: "16px",
        margin: "0 0 16px",
    },
    section: {
        marginTop: "32px",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "5px",
        border: "1px solid #e5e7eb",
    },
    statsContainer: {
        margin: "32px 0",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "5px",
        width: "100%",
    },
    stat: {
        marginBottom: "16px",
        padding: "12px",
        backgroundColor: "#fff",
        borderRadius: "4px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    statLabel: {
        color: "#6b7280",
        fontSize: "16px",
        margin: "0 0 8px",
        fontWeight: "500",
    },
    statValue: {
        color: "#1f2937",
        fontSize: "28px",
        fontWeight: "700",
        margin: 0,
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #e5e7eb",
    },
    progressSection: {
        margin: "24px 0",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "5px",
        border: "1px solid #e5e7eb",
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: "16px",
    },
    progressBar: {
        height: "12px",
        backgroundColor: "#e5e7eb",
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "12px",
    },
    progressFill: {
        height: "100%",
        borderRadius: "6px",
        transition: "width 0.3s ease",
    },
    progressStats: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    progressText: {
        fontSize: "14px",
        color: "#4b5563",
        margin: 0,
    },
    progressPercentage: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1f2937",
        margin: 0,
    },
    button: {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "6px",
        textDecoration: "none",
        fontSize: "16px",
        fontWeight: "500",
        display: "inline-block",
    },
    footer: {
        color: "#6b7280",
        fontSize: "14px",
        textAlign: "center",
        marginTop: "32px",
        paddingTop: "16px",
        borderTop: "1px solid #e5e7eb",
    },
    comparison: {
        fontSize: "12px",
        color: "#6b7280",
        marginTop: "4px",
    },
    actionSection: {
        marginTop: "32px",
        padding: "20px",
        textAlign: "center",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    button: {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "6px",
        textDecoration: "none",
        fontSize: "16px",
        fontWeight: "500",
        display: "inline-block",
        textAlign: "center",
    },
}; 