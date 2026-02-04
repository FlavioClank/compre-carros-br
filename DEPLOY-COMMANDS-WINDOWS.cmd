@echo off
echo ================================================
echo   CompreCarrosBR - Deploy Edge Functions
echo   Supabase Externo: vpunpbozwidlzukplfts
echo ================================================
echo.

REM Verificar se Supabase CLI esta instalado
where supabase >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Supabase CLI nao encontrado!
    echo Instale com: npm install -g supabase
    pause
    exit /b 1
)

echo [1/7] Fazendo login no Supabase...
echo (Vai abrir o navegador para autenticar)
supabase login

echo.
echo [2/7] Linkando ao projeto externo...
supabase link --project-ref vpunpbozwidlzukplfts

echo.
echo [3/7] Configurando SUPABASE_URL...
supabase secrets set SUPABASE_URL=https://vpunpbozwidlzukplfts.supabase.co

echo.
echo ================================================
echo   ATENCAO: Cole sua SERVICE_ROLE_KEY abaixo
echo   (Encontre em: Supabase Dashboard > Settings > API)
echo ================================================
set /p SERVICE_KEY="SERVICE_ROLE_KEY: "

echo.
echo [4/7] Configurando SUPABASE_SERVICE_ROLE_KEY...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%

echo.
echo [5/7] Deployando Edge Functions...
echo.

echo   - create-garage
supabase functions deploy create-garage --no-verify-jwt

echo   - reset-garage-password
supabase functions deploy reset-garage-password --no-verify-jwt

echo   - update-garage-email
supabase functions deploy update-garage-email --no-verify-jwt

echo   - track-analytics
supabase functions deploy track-analytics --no-verify-jwt

echo   - sitemap
supabase functions deploy sitemap --no-verify-jwt

echo.
echo ================================================
echo   [6/7] Verificando deploys...
echo ================================================
supabase functions list

echo.
echo ================================================
echo   DEPLOY CONCLUIDO!
echo ================================================
echo.
echo Proximos passos:
echo   1. Faca push do codigo para GitHub
echo   2. Importe na Vercel
echo   3. Configure as variaveis do ENV-VERCEL.txt
echo   4. Adicione o dominio comprecarrosbr.com.br
echo.
echo Teste as functions:
echo   https://vpunpbozwidlzukplfts.supabase.co/functions/v1/sitemap
echo.
pause
