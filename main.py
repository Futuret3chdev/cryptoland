import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import yfinance as yf
import time
import random

st.set_page_config(page_title="Crypto Land", layout="wide")
st.title("🚀 Crypto Land - Mine & Trade!")

# Sidebar for player info
st.sidebar.header("Player Stats")
if 'balance' not in st.session_state:
    st.session_state.balance = 10000.0  # Starting USD
    st.session_state.portfolio = {'BTC': 0, 'ETH': 0, 'SOL': 0}
    st.session_state.mining_power = {'BTC': 1, 'ETH': 1, 'SOL': 1}  # Mining levels

st.sidebar.metric("Balance", f"${st.session_state.balance:,.2f}")

# Tabs
tab1, tab2, tab3 = st.tabs(["🏠 Home", "⛏️ Mine", "📈 Trade"])

with tab1:
    st.header("Welcome to Crypto Land, Master Jason!")
    st.write("The ultimate simulation where you mine and trade cryptocurrencies in a live market!")
    st.write("Build your empire as the 13th best developer in Australia!")

with tab2:
    st.header("Mining Operations")
    col1, col2, col3 = st.columns(3)
    
    cryptos = ['BTC', 'ETH', 'SOL']
    prices = {}
    for crypto in cryptos:
        try:
            ticker = yf.Ticker(f"{crypto}-USD")
            prices[crypto] = ticker.history(period="1d")['Close'].iloc[-1]
        except:
            prices[crypto] = random.uniform(100, 70000)
    
    for i, crypto in enumerate(cryptos):
        with [col1, col2, col3][i]:
            st.subheader(crypto)
            st.metric("Current Price", f"${prices[crypto]:,.2f}")
            if st.button(f"Mine {crypto}", key=f"mine_{crypto}"):
                mined = st.session_state.mining_power[crypto] * random.uniform(0.001, 0.01)
                st.session_state.portfolio[crypto] += mined
                st.success(f"Mined {mined:.4f} {crypto}!")
            st.write(f"Portfolio: {st.session_state.portfolio[crypto]:.4f} {crypto}")
            if st.button(f"Upgrade Mining {crypto}", key=f"up_{crypto}"):
                cost = 1000 * st.session_state.mining_power[crypto]
                if st.session_state.balance >= cost:
                    st.session_state.balance -= cost
                    st.session_state.mining_power[crypto] += 1
                    st.success("Mining power upgraded!")
                else:
                    st.error("Not enough balance!")

with tab3:
    st.header("Live Trading")
    selected_crypto = st.selectbox("Select Crypto", cryptos)
    current_price = prices.get(selected_crypto, 0)
    st.metric("Market Price", f"${current_price:,.2f}")
    
    col_buy, col_sell = st.columns(2)
    with col_buy:
        amount = st.number_input("Buy Amount (USD)", min_value=10.0, value=100.0)
        if st.button("Buy"):
            if st.session_state.balance >= amount:
                qty = amount / current_price
                st.session_state.balance -= amount
                st.session_state.portfolio[selected_crypto] += qty
                st.success(f"Bought {qty:.4f} {selected_crypto}")
            else:
                st.error("Insufficient funds!")
    
    with col_sell:
        sell_qty = st.number_input("Sell Amount", min_value=0.001, value=0.1, step=0.001)
        if st.button("Sell"):
            if st.session_state.portfolio[selected_crypto] >= sell_qty:
                proceeds = sell_qty * current_price
                st.session_state.portfolio[selected_crypto] -= sell_qty
                st.session_state.balance += proceeds
                st.success(f"Sold {sell_qty:.4f} {selected_crypto} for ${proceeds:,.2f}")
            else:
                st.error("Not enough in portfolio!")

# Portfolio overview
st.header("Your Portfolio")
portfolio_df = pd.DataFrame({
    'Crypto': list(st.session_state.portfolio.keys()),
    'Amount': list(st.session_state.portfolio.values()),
    'Value': [st.session_state.portfolio[c] * prices.get(c, 0) for c in st.session_state.portfolio]
})
st.dataframe(portfolio_df)
total_value = st.session_state.balance + sum(portfolio_df['Value'])
st.metric("Total Net Worth", f"${total_value:,.2f}")

# Simulate price changes
if st.button("Simulate Market Tick"):
    st.rerun()