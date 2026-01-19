<template>
    <v-container class="pt-16 pb-12" style="max-width: 800px;">
        <v-card class="pa-8" rounded="xl" elevation="4">
            <h1 class="text-h4 font-weight-bold mb-6">Termos de Serviço</h1>

            <p class="mb-4 text-body-1">
                Última atualização: {{ new Date().toLocaleDateString() }}
            </p>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">1. Aceitação dos Termos</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Ao acessar e usar o <strong>Movie Randomizer</strong>, você aceita e concorda em estar vinculado aos
                    termos e disposições deste acordo.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">2. Uso do Serviço</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Você concorda em usar o serviço apenas para fins legais e de acordo com estes Termos. Você é
                    responsável por manter a confidencialidade da sua conta Google usada para acessar o serviço.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">3. Acesso ao Google Drive</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    O serviço requer acesso a um arquivo específico do seu Google Drive para funcionar. Ao selecionar um
                    arquivo, você concede permissão ao aplicativo para ler e modificar esse arquivo específico. Retemos
                    apenas as permissões necessárias para a operação do aplicativo.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">4. Isenção de Responsabilidade</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    O serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros.
                    Não nos responsabilizamos por qualquer perda de dados que possa ocorrer, embora tomemos precauções
                    para evitar isso.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">5. Alterações nos Termos</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. Seu uso continuado do serviço
                    após quaisquer alterações constitui aceitação dos novos termos.
                </p>
            </section>

            <v-btn to="/faq" variant="text" color="primary" class="mt-4">Voltar</v-btn>
        </v-card>
    </v-container>
</template>
